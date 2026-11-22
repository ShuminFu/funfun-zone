/**
 * Verify a Cloudflare Access application token.
 * The signature is checked against the team JWKS. Email headers, cookies'
 * mere presence, and localStorage are not identity.
 */

export interface GateEnv {
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  OWNER_EMAIL?: string;
  PRIVATE_NOTES_ORIGIN?: string;
  PRIVATE_NOTES_ALLOW_PREVIEW?: string;
  ASSETS?: { fetch(input: Request | string): Promise<Response> };
}

export interface AccessConfig {
  /** https://<team>.cloudflareaccess.com */
  issuer: string;
  jwksUrl: string;
  aud: string;
  ownerEmail: string;
}

export type Identity =
  | { status: 'anonymous' }
  | { status: 'invalid' }
  | { status: 'authenticated'; owner: boolean; token: string };

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface AccessDeps {
  fetch?: FetchLike;
  now?: () => number;
}

/** Access will not issue a longer application token than one month. */
const MAX_SESSION_MS = 32 * 24 * 60 * 60 * 1000;
const CLOCK_SKEW_MS = 60_000;
const JWKS_TTL_MS = 60 * 60 * 1000;
const MAX_TOKEN_LENGTH = 12_000;
const MAX_JWKS_BYTES = 100_000;

const BLOCKED_EMAIL_DOMAINS = new Set(['example.com', 'example.org', 'example.net', 'localhost', 'invalid']);
const BLOCKED_TEAM_LABELS = new Set([
  'example',
  'your-team',
  'yourteam',
  'your_team',
  'changeme',
  'replace-me',
  'team',
]);

interface JwtHeader {
  alg?: string;
  kid?: string;
  typ?: string;
  crit?: unknown;
}

interface JwtClaims {
  iss?: unknown;
  aud?: unknown;
  exp?: unknown;
  nbf?: unknown;
  email?: unknown;
}

interface AccessJwk extends JsonWebKey {
  kid?: string;
  alg?: string;
  use?: string;
}

let jwksCache: { url: string; keys: Map<string, AccessJwk>; expires: number } | null = null;

export function clearJwksCache(): void {
  jwksCache = null;
}

export function readAccessConfig(env: GateEnv): AccessConfig | null {
  const aud = env.ACCESS_AUD?.trim().toLowerCase() ?? '';
  if (!/^[a-f0-9]{32,128}$/.test(aud)) return null;
  const ownerEmail = normalizeEmail(env.OWNER_EMAIL ?? '');
  if (!isUsableOwnerEmail(ownerEmail)) return null;
  const issuer = normalizeIssuer(env.ACCESS_TEAM_DOMAIN ?? '');
  if (!issuer) return null;
  return { aud, ownerEmail, issuer, jwksUrl: `${issuer}/cdn-cgi/access/certs` };
}

export function normalizeIssuer(raw: string): string | null {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return null;
  const withScheme = /^https:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.port) {
    return null;
  }
  if (url.pathname !== '/' && url.pathname !== '') return null;
  const host = url.hostname.toLowerCase();
  const suffix = '.cloudflareaccess.com';
  if (!host.endsWith(suffix)) return null;
  const label = host.slice(0, -suffix.length);
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) return null;
  if (BLOCKED_TEAM_LABELS.has(label)) return null;
  return `https://${host}`;
}

export function normalizeEmail(raw: string): string {
  return raw.trim().normalize('NFKC').toLowerCase();
}

function isUsableOwnerEmail(email: string): boolean {
  if (email.length < 6 || email.length > 320) return false;
  if (email.includes('replace_with') || email.includes('changeme') || email.includes('your-email')) return false;
  const at = email.indexOf('@');
  if (at <= 0 || at !== email.lastIndexOf('@')) return false;
  const domain = email.slice(at + 1);
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) return false;
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) return false;
  if (/[\s<>"'`]/.test(email)) return false;
  return true;
}

export async function identify(request: Request, env: GateEnv, deps: AccessDeps = {}): Promise<Identity> {
  const tokens = collectTokens(request);
  const config = readAccessConfig(env);
  if (!config) return tokens.length > 0 ? { status: 'invalid' } : { status: 'anonymous' };
  if (tokens.length === 0) return { status: 'anonymous' };

  let nonOwner: string | null = null;
  let sawInvalid = false;
  for (const token of tokens) {
    const verified = await verifyAccessJwt(token, config, deps);
    if (!verified) {
      sawInvalid = true;
      continue;
    }
    if (verified.owner) return { status: 'authenticated', owner: true, token };
    if (verified.email) nonOwner = token;
    else sawInvalid = true;
  }
  if (nonOwner) return { status: 'authenticated', owner: false, token: nonOwner };
  return sawInvalid ? { status: 'invalid' } : { status: 'anonymous' };
}

export function collectTokens(request: Request): string[] {
  const found: string[] = [];
  const header = request.headers.get('Cf-Access-Jwt-Assertion')?.trim();
  const cookie = readCookie(request, 'CF_Authorization');
  for (const token of [cookie, header]) {
    if (!token || token.length > MAX_TOKEN_LENGTH || found.includes(token)) continue;
    found.push(token);
  }
  return found;
}

function readCookie(request: Request, name: string): string | null {
  const raw = request.headers.get('cookie');
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() !== name) continue;
    const value = part.slice(eq + 1).trim();
    return value || null;
  }
  return null;
}

interface VerifiedToken {
  email: string | null;
  owner: boolean;
}

export async function verifyAccessJwt(
  token: string,
  config: AccessConfig,
  deps: AccessDeps = {},
): Promise<VerifiedToken | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || parts.some((part) => part.length === 0)) return null;
    const header = decodeJson<JwtHeader>(parts[0]);
    if (!header || header.alg !== 'RS256' || header.crit) return null;
    if (header.typ && header.typ !== 'JWT') return null;
    if (!header.kid) return null;
    const key = await importVerificationKey(header.kid, config, deps);
    if (!key) return null;
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = base64UrlDecode(parts[2]);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, data);
    if (!ok) return null;
    const claims = decodeJson<JwtClaims>(parts[1]);
    if (!claims || claims.iss !== config.issuer) return null;
    if (!audienceMatches(claims.aud, config.aud)) return null;
    if (!lifetimeOk(claims, deps.now?.() ?? Date.now())) return null;
    if (claims.email === undefined || claims.email === null) return { email: null, owner: false };
    if (typeof claims.email !== 'string') return null;
    const email = normalizeEmail(claims.email);
    if (!email.includes('@')) return null;
    const owner = await emailsEqual(email, config.ownerEmail);
    return { email, owner };
  } catch {
    return null;
  }
}

function audienceMatches(aud: unknown, expected: string): boolean {
  if (typeof aud === 'string') return aud === expected;
  if (!Array.isArray(aud)) return false;
  return aud.some((item) => item === expected);
}

function lifetimeOk(claims: JwtClaims, now: number): boolean {
  if (typeof claims.exp !== 'number' || !Number.isFinite(claims.exp)) return false;
  if (claims.exp * 1000 + CLOCK_SKEW_MS < now) return false;
  if (claims.exp * 1000 - now > MAX_SESSION_MS + CLOCK_SKEW_MS) return false;
  if (claims.nbf !== undefined) {
    if (typeof claims.nbf !== 'number' || !Number.isFinite(claims.nbf)) return false;
    if (claims.nbf * 1000 - CLOCK_SKEW_MS > now) return false;
  }
  return true;
}

async function importVerificationKey(kid: string, config: AccessConfig, deps: AccessDeps): Promise<CryptoKey | null> {
  let keys = await loadKeys(config, deps, false);
  if (!keys?.has(kid)) keys = await loadKeys(config, deps, true);
  const jwk = keys?.get(kid);
  if (!jwk || jwk.kty !== 'RSA') return null;
  if (jwk.alg && jwk.alg !== 'RS256') return null;
  if (jwk.use && jwk.use !== 'sig') return null;
  if (jwk.d) return null;
  const { kty, n, e } = jwk;
  if (!n || !e) return null;
  return crypto.subtle.importKey(
    'jwk',
    { kty, n, e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
}

async function loadKeys(
  config: AccessConfig,
  deps: AccessDeps,
  force: boolean,
): Promise<Map<string, AccessJwk> | null> {
  const now = deps.now?.() ?? Date.now();
  if (!force && jwksCache && jwksCache.url === config.jwksUrl && jwksCache.expires > now) {
    return jwksCache.keys;
  }
  if (!config.jwksUrl.startsWith(`${config.issuer}/cdn-cgi/access/certs`)) return null;
  const fetchImpl = deps.fetch ?? globalThis.fetch;
  const response = await fetchImpl(config.jwksUrl, {
    redirect: 'manual',
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(5_000),
  });
  if (response.status !== 200) return null;
  const text = await response.text();
  if (text.length > MAX_JWKS_BYTES) return null;
  const parsed = JSON.parse(text) as { keys?: AccessJwk[] };
  if (!parsed.keys?.length) return null;
  const keys = new Map<string, AccessJwk>();
  for (const key of parsed.keys) {
    if (key?.kid && key.kty === 'RSA' && !key.d) keys.set(key.kid, key);
  }
  if (keys.size === 0) return null;
  jwksCache = { url: config.jwksUrl, keys, expires: now + JWKS_TTL_MS };
  return keys;
}

async function emailsEqual(left: string, right: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(left)),
    crypto.subtle.digest('SHA-256', encoder.encode(right)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = x.length ^ y.length;
  const length = Math.max(x.length, y.length);
  for (let i = 0; i < length; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

function decodeJson<T>(part: string): T | null {
  try {
    const value = JSON.parse(new TextDecoder().decode(base64UrlDecode(part))) as T;
    if (!value || typeof value !== 'object') return null;
    return value;
  } catch {
    return null;
  }
}

function base64UrlDecode(part: string): Uint8Array {
  const padded = part.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (part.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function accessLoginUrl(issuer: string, aud: string, requestUrl: string, nextPath: string): string {
  const host = new URL(requestUrl).host;
  const url = new URL(`/cdn-cgi/access/login/${host}`, issuer);
  url.searchParams.set('kid', aud);
  url.searchParams.set('redirect_url', nextPath);
  return url.href;
}

export function accessLogoutUrl(requestUrl: string): string {
  const origin = new URL(requestUrl).origin;
  const url = new URL('/cdn-cgi/access/logout', origin);
  url.searchParams.set('returnTo', `${origin}/`);
  return url.href;
}

/** Same-origin path only, so the login redirect cannot leave the site. */
export function safeNextPath(request: Request): string {
  const raw = new URL(request.url).searchParams.get('next') ?? '/';
  let target: URL;
  try {
    target = new URL(raw, request.url);
  } catch {
    return '/';
  }
  if (target.origin !== new URL(request.url).origin) return '/';
  if (target.username || target.password) return '/';
  if (!target.pathname.startsWith('/') || target.pathname.startsWith('//') || target.pathname.includes('\\')) {
    return '/';
  }
  return `${target.pathname}${target.search}`;
}
