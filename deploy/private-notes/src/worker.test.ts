import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { before, beforeEach, describe, it } from 'node:test';
import { clearJwksCache, type FetchLike } from '../../../functions/lib/access.ts';
import { FIXTURE_NOTE_BODY, makeAccessSigner, ownerClaims, TEST_ENV, type AccessSigner } from '../../../functions/lib/jwt-fixture.ts';
import { handlePrivateNotes } from './worker.ts';

const NOW = Date.parse('2026-11-22T00:00:00Z');
const CATALOG = {
  notes: [
    {
      slug: 'fixture-note',
      title: 'Fixture note',
      planted: '2026-11-01',
      body: FIXTURE_NOTE_BODY,
    },
  ],
};

describe('private notes deployment', () => {
  let signer: AccessSigner;

  before(async () => {
    signer = await makeAccessSigner();
  });

  beforeEach(() => clearJwksCache());

  it('ships an empty catalog from this public repository', () => {
    const catalog = JSON.parse(readFileSync(new URL('../catalog.json', import.meta.url), 'utf8')) as { notes: unknown[] };
    assert.deepEqual(catalog.notes, []);
  });

  it('returns notes only to the verified owner and never caches them', async () => {
    const deps = { fetch: jwks(signer), now: () => NOW };
    const token = await signer.sign(ownerClaims(NOW));
    const owner = await call('/index.json', deps, token);
    assert.equal(owner.status, 200);
    const index = (await owner.json()) as { notes: Array<{ body?: string }> };
    assert.equal(index.notes[0]?.body, undefined);
    assert.equal(owner.headers.get('cache-control'), 'private, no-store');
    assert.equal(owner.headers.get('cdn-cache-control'), 'no-store');

    const note = await call('/notes/fixture-note.json', deps, token);
    assert.match(await note.text(), new RegExp(FIXTURE_NOTE_BODY));

    const anon = await call('/notes/fixture-note.json', deps);
    assert.equal(anon.status, 404);
    assert.equal((await anon.text()).includes(FIXTURE_NOTE_BODY), false);

    const other = await call('/notes/fixture-note.json', deps, await signer.sign(ownerClaims(NOW, 'reader@fixture.test')));
    assert.equal(other.status, 403);
    assert.equal((await other.text()).includes(FIXTURE_NOTE_BODY), false);

    const expired = await call(
      '/index.json',
      deps,
      await signer.sign({ ...ownerClaims(NOW), exp: Math.floor(NOW / 1000) - 600 }),
    );
    assert.equal(expired.status, 404);
    assert.equal((await expired.text()).includes(FIXTURE_NOTE_BODY), false);

    const spoof = await handlePrivateNotes(
      new Request('https://private-notes.fixture.test/index.json', {
        headers: { 'Cf-Access-Authenticated-User-Email': 'owner@fixture.test' },
      }),
      TEST_ENV,
      CATALOG,
      deps,
    );
    assert.equal(spoof.status, 404);
    assert.equal((await spoof.text()).includes(FIXTURE_NOTE_BODY), false);
  });

  it('fails closed when Access is not configured', async () => {
    const token = await signer.sign(ownerClaims(NOW));
    const response = await handlePrivateNotes(
      new Request('https://private-notes.fixture.test/index.json', {
        headers: { 'Cf-Access-Jwt-Assertion': token },
      }),
      {},
      CATALOG,
      { fetch: jwks(signer), now: () => NOW },
    );
    assert.equal(response.status, 404);
    assert.equal((await response.text()).includes(FIXTURE_NOTE_BODY), false);
  });
});

function call(path: string, deps: { fetch: FetchLike; now: () => number }, token?: string): Promise<Response> {
  return handlePrivateNotes(
    new Request(`https://private-notes.fixture.test${path}`, {
      headers: token ? { 'Cf-Access-Jwt-Assertion': token } : {},
    }),
    TEST_ENV,
    CATALOG,
    deps,
  );
}

function jwks(signer: AccessSigner): FetchLike {
  return async () =>
    new Response(JSON.stringify(signer.jwks()), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
}
