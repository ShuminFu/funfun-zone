import assert from 'node:assert/strict';
import { before, beforeEach, describe, it } from 'node:test';
import { clearJwksCache, type FetchLike, type GateEnv } from './access.ts';
import { handleGate } from './gate.ts';
import { FIXTURE_NOTE_BODY, makeAccessSigner, ownerClaims, TEST_ENV, type AccessSigner } from './jwt-fixture.ts';

const NOW = Date.parse('2026-11-22T00:00:00Z');
const SHELL = `<!doctype html><html><head><title>FunFun Zone | A blog</title>
<link rel="canonical" href="https://funfun.zone/" />
<meta property="og:url" content="https://funfun.zone/" />
</head><body>
<!-- owner-entry:desktop -->
<a href="/auth/login/" data-auth="sign-in" class="font-sans text-sm">Sign in</a>
<!-- owner-entry:mobile -->
<a href="/auth/login/" data-auth="sign-in" class="block">Sign in</a>
<main id="page-main" class="grow"><p>Home</p></main>
</body></html>`;

const NOTE = {
  slug: 'fixture-note',
  title: 'Fixture note',
  planted: '2026-11-01',
  body: `Hello ${FIXTURE_NOTE_BODY}\n\n<script>alert(1)</script>`,
};

describe('private notes gate', () => {
  beforeEach(() => clearJwksCache());

  it('serves the public page unchanged to anonymous visitors', async () => {
    const { response } = await send('/', {});
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'public, max-age=3600');
    assert.equal(await response.text(), SHELL);
    assert.equal(response.headers.get('cdn-cache-control'), null);
  });

  it('injects the owner entry only for a verified owner and refuses to cache it', async () => {
    const token = await currentSigner.sign(ownerClaims(NOW));
    const owner = await send('/', { token });
    const html = await owner.response.text();
    assert.match(html, /href="\/private\/"/);
    assert.match(html, /Private Notes/);
    assert.match(html, />Sign out</);
    assert.doesNotMatch(html, /owner@fixture.test/);
    assert.doesNotMatch(html, /private-notes\.fixture\.test/);
    assert.equal(owner.response.headers.get('cache-control'), 'private, no-store');
    assert.equal(owner.response.headers.get('cdn-cache-control'), 'no-store');
    assert.equal(owner.response.headers.get('cloudflare-cdn-cache-control'), 'no-store');
    assert.equal(owner.hits.some((hit) => hit.url.includes('private-notes')), false);

    const shared = new Map<string, string>();
    const remember = async (path: string, credential?: string) => {
      const result = await send(path, credential ? { token: credential } : {});
      const body = await result.response.text();
      const cacheControl = `${result.response.headers.get('cache-control')} ${result.response.headers.get('cdn-cache-control')}`;
      if (!/no-store|private/.test(cacheControl)) shared.set(path, body);
      return body;
    };
    const ownerBody = await remember('/', token);
    assert.match(ownerBody, /Private Notes/);
    assert.notEqual(shared.get('/')?.includes('Private Notes'), true);
    const anonBody = await remember('/');
    assert.equal(anonBody.includes('Private Notes'), false);
    assert.equal(shared.get('/'), SHELL);
  });

  it('hides the entry from a non-owner, an expired token, a spoofed header, and a pages.dev host', async () => {
    const other = await currentSigner.sign(ownerClaims(NOW, 'reader@fixture.test'));
    const expired = await currentSigner.sign({ ...ownerClaims(NOW), exp: Math.floor(NOW / 1000) - 600 });
    for (const token of [other, expired]) {
      const page = await send('/', { token });
      const html = await page.response.text();
      assert.equal(html.includes('href="/private/"'), false, 'public page leaked the entry');
      assert.equal(page.hits.some((hit) => hit.url.includes('private-notes')), false);
    }

    const spoof = await send('/', { headers: { 'Cf-Access-Authenticated-User-Email': 'owner@fixture.test' } });
    assert.equal(await spoof.response.text(), SHELL);
    assert.equal(spoof.response.headers.get('cache-control'), 'public, max-age=3600');

    const preview = await send('/', { token: await currentSigner.sign(ownerClaims(NOW)), host: 'https://funfun-zone.pages.dev' });
    assert.equal((await preview.response.text()).includes('href="/private/"'), false);
  });

  it('does not fetch private notes unless the caller is the verified owner on an allowed host', async () => {
    const token = await currentSigner.sign(ownerClaims(NOW));
    const cases = [
      send('/private/', {}),
      send('/private/', { token: await currentSigner.sign(ownerClaims(NOW, 'reader@fixture.test')) }),
      send('/private/', { token, env: { OWNER_EMAIL: undefined, ACCESS_AUD: undefined } }),
      send('/private/', { token, host: 'https://funfun-zone.pages.dev' }),
      send('/private/', { headers: { 'Cf-Access-Authenticated-User-Email': 'owner@fixture.test' } }),
    ];
    for (const pending of cases) {
      const result = await pending;
      const html = await result.response.text();
      assert.equal(html.includes(FIXTURE_NOTE_BODY), false);
      assert.equal(result.hits.some((hit) => hit.url.includes('private-notes')), false);
    }

    const owner = await send('/private/fixture-note/', { token });
    const html = await owner.response.text();
    assert.equal(owner.response.status, 200);
    assert.match(html, new RegExp(FIXTURE_NOTE_BODY));
    assert.match(html, /&lt;script&gt;/);
    assert.doesNotMatch(html, /<script>alert/);
    assert.equal(owner.response.headers.get('cache-control'), 'private, no-store');
    assert.equal(owner.response.headers.get('x-robots-tag'), 'noindex, nofollow');
    assert.doesNotMatch(html, /private-notes\.fixture\.test/);
    const call = owner.hits.find((hit) => hit.url.includes('/notes/fixture-note.json'));
    assert.ok(call);
    const headers = new Headers(call?.init?.headers);
    assert.equal(headers.get('Cf-Access-Jwt-Assertion'), token);
    assert.equal(headers.get('cookie'), null);
    assert.equal(call?.init?.redirect, 'manual');
  });

  it('fails closed when the origin is missing, redirects, or returns html', async () => {
    const token = await currentSigner.sign(ownerClaims(NOW));
    const missing = await send('/private/', { token, env: { PRIVATE_NOTES_ORIGIN: undefined } });
    assert.match(await missing.response.text(), /not connected yet/);
    assert.equal(missing.hits.some((hit) => hit.url.includes('private-notes')), false);

    const redirected = await send('/private/', { token, originStatus: 302 });
    const redirectHtml = await redirected.response.text();
    assert.equal(redirected.response.status, 502);
    assert.equal(redirected.response.headers.get('location'), null);
    assert.equal(redirectHtml.includes(FIXTURE_NOTE_BODY), false);

    const htmlOrigin = await send('/private/fixture-note/', { token, originType: 'text/html' });
    assert.equal(htmlOrigin.response.status, 502);
    assert.equal((await htmlOrigin.response.text()).includes('<script>alert'), false);
  });

  it('starts Access login without an open redirect and does nothing when unconfigured', async () => {
    const anon = await send('/auth/login/?next=https://evil.example/phish', {});
    assert.equal(anon.response.status, 302);
    const location = anon.response.headers.get('location') ?? '';
    assert.match(location, /^https:\/\/fixture-team\.cloudflareaccess\.com\/cdn-cgi\/access\/login\/funfun\.zone/);
    assert.equal(location.includes('evil.example'), false);
    assert.equal(anon.response.headers.get('cache-control'), 'private, no-store');

    const owner = await send('/auth/login/?next=/posts/', { token: await currentSigner.sign(ownerClaims(NOW)) });
    assert.equal(owner.response.headers.get('location'), '/posts/');

    const off = await send('/auth/login/', { env: { ACCESS_AUD: undefined, OWNER_EMAIL: undefined, ACCESS_TEAM_DOMAIN: undefined } });
    const html = await off.response.text();
    assert.equal(off.response.status, 404);
    assert.match(html, /not set up yet/);
    assert.equal(html.includes('href="/private/"'), false);
    assert.equal(html.includes('@'), false);

    const logout = await send('/auth/logout/', {});
    assert.equal(
      logout.response.headers.get('location'),
      'https://funfun.zone/cdn-cgi/access/logout?returnTo=https%3A%2F%2Ffunfun.zone%2F',
    );
  });

  it('does not rewrite hashed assets when a credential is present', async () => {
    const token = await currentSigner.sign(ownerClaims(NOW));
    const asset = await send('/_astro/app.css', {
      token,
      nextBody: '.rule{}',
      nextType: 'text/css',
    });
    assert.equal(await asset.response.text(), '.rule{}');
    assert.match(asset.response.headers.get('cache-control') ?? '', /no-store/);
  });
});

interface SendOptions {
  token?: string;
  headers?: Record<string, string>;
  host?: string;
  env?: Partial<GateEnv>;
  originStatus?: number;
  originType?: string;
  nextBody?: string;
  nextType?: string;
}

async function send(path: string, options: SendOptions) {
  const signer = currentSigner;
  const hits: { url: string; init?: RequestInit }[] = [];
  const fetchImpl: FetchLike = async (input, init) => {
    const url = String(input);
    hits.push({ url, init });
    if (url.endsWith('/cdn-cgi/access/certs')) {
      return new Response(JSON.stringify(signer.jwks()), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (url.startsWith('https://private-notes.fixture.test/')) {
      if (options.originStatus && options.originStatus !== 200) {
        return new Response(null, { status: options.originStatus, headers: { location: 'https://evil.example/secret' } });
      }
      if (url.endsWith('/index.json')) {
        return new Response(JSON.stringify({ notes: [{ slug: NOTE.slug, title: NOTE.title, planted: NOTE.planted }] }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      if (url.endsWith('/notes/fixture-note.json')) {
        return new Response(JSON.stringify(NOTE), {
          status: 200,
          headers: { 'content-type': options.originType ?? 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'not_found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }
    throw new Error(`unexpected fetch ${url}`);
  };
  const env: GateEnv = {
    ...TEST_ENV,
    ...options.env,
    ASSETS: {
      fetch: async () => new Response(SHELL, { headers: { 'content-type': 'text/html; charset=utf-8' } }),
    },
  };
  const headers = new Headers(options.headers);
  if (options.token) headers.set('cookie', `CF_Authorization=${options.token}`);
  const request = new Request(`${options.host ?? 'https://funfun.zone'}${path}`, { headers });
  const response = await handleGate(
    request,
    env,
    async () =>
      new Response(options.nextBody ?? SHELL, {
        headers: {
          'content-type': options.nextType ?? 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=3600',
        },
      }),
    { fetch: fetchImpl, now: () => NOW },
  );
  return { response, hits };
}

let currentSigner: AccessSigner;

before(async () => {
  currentSigner = await makeAccessSigner();
});
