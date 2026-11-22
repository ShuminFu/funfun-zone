/**
 * The private-notes origin is a separate deployment. Its URL is not a
 * credential: the worker there still has to verify the Access token.
 */

import type { GateEnv } from './access.ts';

const BLOCKED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'funfun.zone',
  'www.funfun.zone',
]);

export function readPrivateOrigin(raw: string | undefined, requestHost: string): URL | null {
  const value = raw?.trim() ?? '';
  if (!value) return null;
  if (/replace|changeme|your-private|example\.(com|org|net)/i.test(value)) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return null;
  if (url.port && url.port !== '443') return null;
  if (url.pathname !== '/' && url.pathname !== '') return null;
  const host = url.hostname.toLowerCase();
  const incoming = requestHost.toLowerCase();
  if (host === incoming || BLOCKED_HOSTS.has(host)) return null;
  if (isIp(host) || host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.localhost')) {
    return null;
  }
  return new URL(`https://${host}/`);
}

/**
 * Public preview and pages.dev hostnames stay on the public site even if a
 * production token is replayed at them. The custom domain is the entry.
 */
export function privateSurfaceOpen(hostname: string, env: GateEnv): boolean {
  const host = hostname.toLowerCase();
  if (isIp(host)) return false;
  if (host === 'pages.dev' || host.endsWith('.pages.dev')) {
    return env.PRIVATE_NOTES_ALLOW_PREVIEW === 'true';
  }
  return true;
}

function isIp(host: string): boolean {
  if (host.includes(':')) return true;
  const parts = host.split('.');
  if (parts.length !== 4) return false;
  if (!parts.every((part) => /^\d{1,3}$/.test(part))) return false;
  return parts.every((part) => Number(part) <= 255);
}
