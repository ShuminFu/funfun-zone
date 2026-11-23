/**
 * Public Pages stay static. This gate runs at the edge: it verifies Access,
 * injects the owner entry, and proxies note JSON from a separate deployment.
 * Unconfigured, unsigned, expired, and non-owner requests fail closed.
 */

import {
  accessLoginUrl,
  accessLogoutUrl,
  identify,
  readAccessConfig,
  safeNextPath,
  type AccessDeps,
  type FetchLike,
  type GateEnv,
  type Identity,
} from './access.ts';
import { parseIndex, parseNote, type PrivateNote, type PrivateNoteMeta } from './catalog.ts';
import { applyChrome, type ChromeMode } from './chrome.ts';
import { libraryMain, messageMain, noteMain, renderInsideShell } from './html.ts';
import { renderMarkdown } from './markdown.ts';
import { privateSurfaceOpen, readPrivateOrigin } from './origin.ts';

const MAX_HTML = 2_000_000;
const MAX_ORIGIN_BYTES = 1_000_000;

export async function handleGate(
  request: Request,
  env: GateEnv,
  next: () => Promise<Response>,
  deps: AccessDeps = {},
): Promise<Response> {
  const url = new URL(request.url);
  const path = stripSlash(url.pathname);
  if (path === '/auth/login' || path === '/auth/logout' || path === '/private' || path.startsWith('/private/')) {
    try {
      return await handleGated(request, env, deps);
    } catch {
      return failClosed();
    }
  }
  const response = await next();
  try {
    return await personalizePublic(request, response, env, deps);
  } catch {
    return response;
  }
}

async function handleGated(request: Request, env: GateEnv, deps: AccessDeps): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return textResponse('Method not allowed', 405);
  const url = new URL(request.url);
  const path = stripSlash(url.pathname);
  const identity = await identify(request, env, deps);
  if (path === '/auth/logout') return redirect(accessLogoutUrl(request.url));
  if (path === '/auth/login') return login(request, env, identity, deps);
  return privateNotes(request, env, identity, deps);
}

async function login(request: Request, env: GateEnv, identity: Identity, deps: AccessDeps): Promise<Response> {
  const config = readAccessConfig(env);
  if (!config) {
    return page(
      request,
      env,
      identity,
      deps,
      404,
      'Sign in',
      messageMain(
        'Sign in',
        'Sign-in is not set up yet',
        'This deployment has no Cloudflare Access configuration. The public garden stays open.',
      ),
    );
  }
  if (identity.status === 'authenticated') return redirect(safeNextPath(request));
  if (identity.status === 'invalid') {
    return page(
      request,
      env,
      identity,
      deps,
      401,
      'Sign in',
      messageMain(
        'Sign in',
        'This sign-in session is not valid',
        'Sign out, then try again. A header or a saved address is not enough.',
        [
          { href: '/auth/logout/', label: 'Sign out' },
          { href: '/', label: 'Home' },
        ],
      ),
    );
  }
  return redirect(accessLoginUrl(config.issuer, config.aud, request.url, safeNextPath(request)));
}

async function privateNotes(
  request: Request,
  env: GateEnv,
  identity: Identity,
  deps: AccessDeps,
): Promise<Response> {
  const url = new URL(request.url);
  const surface = privateSurfaceOpen(url.hostname, env);
  if (identity.status !== 'authenticated' || !identity.owner || !surface) {
    if (identity.status === 'authenticated' && identity.owner && !surface) {
      return page(
        request,
        env,
        identity,
        deps,
        404,
        'Private Notes',
        messageMain('404', 'Private notes are not served here', 'Open them on the site’s own domain after signing in.'),
      );
    }
    if (identity.status === 'authenticated' && !identity.owner) {
      return page(
        request,
        env,
        identity,
        deps,
        403,
        'Private Notes',
        messageMain('403', 'This account cannot open private notes', 'The signed-in Google account is not the owner of this garden.'),
      );
    }
    return page(
      request,
      env,
      { status: 'anonymous' },
      deps,
      404,
      'Page not found',
      messageMain('404', 'Nothing is planted here', 'The page may have moved, or the link was mistyped. The garden index lists every public note.'),
    );
  }

  const slug = privateSlug(url.pathname);
  if (slug === undefined) {
    return page(
      request,
      env,
      identity,
      deps,
      404,
      'Page not found',
      messageMain('404', 'Nothing is planted here', 'The page may have moved, or the link was mistyped.'),
    );
  }

  const origin = readPrivateOrigin(env.PRIVATE_NOTES_ORIGIN, url.hostname);
  if (!origin) {
    return page(
      request,
      env,
      identity,
      deps,
      200,
      'Private Notes',
      messageMain(
        'Private Notes',
        'Private notes are not connected yet',
        'This deployment does not have a separate private-notes origin. Nothing private is stored on the public site.',
      ),
    );
  }

  if (slug === null) {
    const loaded = await loadIndex(origin, identity.token, deps);
    if (loaded.status !== 'ok') return originFailed(request, env, identity, deps);
    return page(request, env, identity, deps, 200, 'Private Notes', libraryMain(loaded.notes));
  }
  const loaded = await loadNote(origin, slug, identity.token, deps);
  if (loaded.status === 'missing') {
    return page(
      request,
      env,
      identity,
      deps,
      404,
      'Private Notes',
      messageMain('404', 'Nothing is planted here', 'That private note is not on this deployment.'),
    );
  }
  if (loaded.status !== 'ok') return originFailed(request, env, identity, deps);
  return page(request, env, identity, deps, 200, loaded.note.title, noteMain(loaded.note, renderMarkdown(loaded.note.body)));
}

function originFailed(request: Request, env: GateEnv, identity: Identity, deps: AccessDeps): Promise<Response> {
  return page(
    request,
    env,
    identity,
    deps,
    502,
    'Private Notes',
    messageMain(
      'Private Notes',
      'Private notes could not be opened',
      'The private deployment did not return a note. The public site is unchanged.',
    ),
  );
}

async function page(
  request: Request,
  env: GateEnv,
  identity: Identity,
  deps: AccessDeps,
  status: number,
  title: string,
  main: string,
): Promise<Response> {
  const shell = await loadShell(request, env);
  const canonical = new URL(withSlash(new URL(request.url).pathname), request.url).href;
  const rendered = renderInsideShell(shell, { title, canonical, main });
  const mode = chromeMode(identity, request, env);
  const body = applyChrome(rendered, mode, new URL(request.url).pathname);
  return htmlResponse(request.method === 'HEAD' ? null : body, status);
}

function chromeMode(identity: Identity, request: Request, env: GateEnv): ChromeMode {
  if (identity.status !== 'authenticated') return 'anonymous';
  if (!identity.owner || !privateSurfaceOpen(new URL(request.url).hostname, env)) return 'signed-in';
  return 'owner';
}

async function loadShell(request: Request, env: GateEnv): Promise<string> {
  if (!env.ASSETS) return fallbackShell();
  try {
    const response = await env.ASSETS.fetch(new Request(new URL('/', request.url)));
    const type = response.headers.get('content-type') ?? '';
    if (!response.ok || !type.includes('text/html')) return fallbackShell();
    const html = await response.text();
    if (!html.includes('id="page-main"') && !html.includes("id='page-main'")) return fallbackShell();
    return html;
  } catch {
    return fallbackShell();
  }
}

function fallbackShell(): string {
  return `<!doctype html><html lang="en"><head><title>${siteName()}</title></head><body><header><!-- owner-entry:desktop --><a href="/auth/login/" data-auth="sign-in" class="font-sans text-sm text-primary-600">Sign in</a><!-- owner-entry:mobile --><a href="/auth/login/" data-auth="sign-in" class="block rounded-lg px-3 py-2 text-sm font-medium text-primary-600">Sign in</a></header><main id="page-main" class="grow"></main></body></html>`;
}

function siteName(): string {
  return 'FunFun Zone';
}

async function personalizePublic(
  request: Request,
  response: Response,
  env: GateEnv,
  deps: AccessDeps,
): Promise<Response> {
  if (!hasCredential(request)) return response;
  const identity = await identify(request, env, deps);
  const type = response.headers.get('content-type') ?? '';
  if (request.method !== 'GET' || !type.includes('text/html')) return noStore(response);
  const html = await response.text();
  if (html.length > MAX_HTML || identity.status !== 'authenticated') return rewriteHtml(response, html);
  const mode: ChromeMode =
    identity.owner && privateSurfaceOpen(new URL(request.url).hostname, env) ? 'owner' : 'signed-in';
  return rewriteHtml(response, applyChrome(html, mode, new URL(request.url).pathname));
}

function hasCredential(request: Request): boolean {
  const header = request.headers.get('Cf-Access-Jwt-Assertion');
  const cookie = request.headers.get('cookie') ?? '';
  return Boolean(header?.trim()) || /(?:^|;\s*)CF_Authorization=/.test(cookie);
}

async function loadIndex(origin: URL, token: string, deps: AccessDeps): Promise<
  { status: 'ok'; notes: PrivateNoteMeta[] } | { status: 'error' }
> {
  const payload = await fetchOrigin(new URL('index.json', origin), token, deps);
  if (payload.status !== 200 || payload.json === undefined) return { status: 'error' };
  return { status: 'ok', notes: parseIndex(payload.json) };
}

async function loadNote(origin: URL, slug: string, token: string, deps: AccessDeps): Promise<
  { status: 'ok'; note: PrivateNote } | { status: 'missing' } | { status: 'error' }
> {
  const payload = await fetchOrigin(new URL(`notes/${slug}.json`, origin), token, deps);
  if (payload.status === 404) return { status: 'missing' };
  if (payload.status !== 200 || payload.json === undefined) return { status: 'error' };
  const note = parseNote(payload.json, true);
  if (!note || note.slug !== slug) return { status: 'error' };
  return { status: 'ok', note };
}

async function fetchOrigin(
  url: URL,
  token: string,
  deps: AccessDeps,
): Promise<{ status: number; json?: unknown }> {
  const fetchImpl: FetchLike = deps.fetch ?? globalThis.fetch;
  const response = await fetchImpl(url, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      accept: 'application/json',
      'Cf-Access-Jwt-Assertion': token,
    },
    signal: AbortSignal.timeout(8_000),
  });
  if (response.status !== 200) return { status: response.status };
  const type = response.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) return { status: 415 };
  const text = await response.text();
  if (text.length > MAX_ORIGIN_BYTES) return { status: 413 };
  try {
    return { status: 200, json: JSON.parse(text) as unknown };
  } catch {
    return { status: 415 };
  }
}

function privateSlug(pathname: string): string | null | undefined {
  const path = stripSlash(pathname);
  if (path === '/private') return null;
  if (!path.startsWith('/private/')) return undefined;
  const rest = path.slice('/private/'.length);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rest)) return undefined;
  return rest;
}

function stripSlash(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

function withSlash(pathname: string): string {
  if (pathname === '/') return pathname;
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function redirect(location: string): Response {
  return new Response(null, { status: 302, headers: personalizedHeaders({ location }) });
}

function failClosed(): Response {
  return htmlResponse(
    '<!doctype html><html lang="en"><head><meta name="robots" content="noindex, nofollow"><title>Page not found</title></head><body><main><h1>Nothing is planted here</h1></main></body></html>',
    404,
  );
}

function textResponse(body: string, status: number): Response {
  const headers = personalizedHeaders({ 'content-type': 'text/plain; charset=utf-8' });
  return new Response(body, { status, headers });
}

function htmlResponse(body: string | null, status: number, headers?: Headers): Response {
  const next = personalizedHeaders();
  if (headers) {
    const type = headers.get('content-type');
    if (type) next.set('content-type', type);
  }
  if (!next.get('content-type')?.includes('text/html')) {
    next.set('content-type', 'text/html; charset=utf-8');
  }
  next.set('x-robots-tag', 'noindex, nofollow');
  next.set('referrer-policy', 'no-referrer');
  next.set('x-content-type-options', 'nosniff');
  return new Response(body, { status, headers: next });
}

function rewriteHtml(response: Response, html: string): Response {
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.delete('content-encoding');
  headers.delete('etag');
  headers.set('cache-control', 'private, no-store');
  headers.set('cdn-cache-control', 'no-store');
  headers.set('cloudflare-cdn-cache-control', 'no-store');
  return new Response(html, { status: response.status, headers });
}

function noStore(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('cache-control', 'private, no-store');
  headers.set('cdn-cache-control', 'no-store');
  headers.set('cloudflare-cdn-cache-control', 'no-store');
  headers.delete('etag');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function personalizedHeaders(extra?: Record<string, string>): Headers {
  const headers = new Headers(extra);
  headers.set('cache-control', 'private, no-store');
  headers.set('cdn-cache-control', 'no-store');
  headers.set('cloudflare-cdn-cache-control', 'no-store');
  return headers;
}
