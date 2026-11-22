/**
 * Isolated notes API. It answers only after the same Access token check as
 * the public gate. The committed catalog is empty; a private repository
 * fills it at its own build, which the public site never runs.
 */

import { identify, type AccessDeps, type GateEnv } from '../../../functions/lib/access.ts';
import { parseCatalog, type PrivateNote } from '../../../functions/lib/catalog.ts';
import catalogJson from '../catalog.json' with { type: 'json' };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function handlePrivateNotes(
  request: Request,
  env: GateEnv,
  catalog: unknown,
  deps: AccessDeps = {},
): Promise<Response> {
  return route(request, env, parseCatalog(catalog), deps);
}

export default {
  fetch(request: Request, env: GateEnv): Promise<Response> {
    return handlePrivateNotes(request, env, catalogJson);
  },
};

async function route(request: Request, env: GateEnv, notes: readonly PrivateNote[], deps: AccessDeps): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return json({ error: 'not_found' }, 405, request.method);
  const identity = await identify(request, env, deps);
  if (identity.status !== 'authenticated') return json({ error: 'not_found' }, 404, request.method);
  if (!identity.owner) return json({ error: 'not_found' }, 403, request.method);
  const path = new URL(request.url).pathname.replace(/\/+$/, '') || '/';
  if (path === '/index.json') {
    const index = notes
      .map(({ slug, title, planted }) => ({ slug, title, planted }))
      .sort((a, b) => b.planted.localeCompare(a.planted) || a.slug.localeCompare(b.slug));
    return json({ notes: index }, 200, request.method);
  }
  const slug = /^\/notes\/([a-z0-9]+(?:-[a-z0-9]+)*)\.json$/.exec(path)?.[1];
  if (!slug || !SLUG.test(slug)) return json({ error: 'not_found' }, 404, request.method);
  const note = notes.find((item) => item.slug === slug);
  if (!note) return json({ error: 'not_found' }, 404, request.method);
  return json({ slug: note.slug, title: note.title, planted: note.planted, body: note.body }, 200, request.method);
}

function json(body: unknown, status: number, method: string): Response {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'private, no-store',
    'cdn-cache-control': 'no-store',
    'cloudflare-cdn-cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'x-robots-tag': 'noindex, nofollow',
    'referrer-policy': 'no-referrer',
  });
  return new Response(method === 'HEAD' ? null : JSON.stringify(body), { status, headers });
}
