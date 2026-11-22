import assert from 'node:assert/strict';
import { before, beforeEach, describe, it } from 'node:test';
import {
  accessLoginUrl,
  accessLogoutUrl,
  clearJwksCache,
  identify,
  readAccessConfig,
  safeNextPath,
  verifyAccessJwt,
} from './access.ts';
import { makeAccessSigner, ownerClaims, TEST_ENV, type AccessSigner } from './jwt-fixture.ts';

const NOW = Date.parse('2026-11-22T00:00:00Z');

describe('Access token verification', () => {
  let signer: AccessSigner;

  before(async () => {
    signer = await makeAccessSigner();
  });

  beforeEach(() => {
    clearJwksCache();
  });

  it('rejects placeholder configuration', () => {
    assert.equal(readAccessConfig({}), null);
    assert.equal(readAccessConfig({ ...TEST_ENV, OWNER_EMAIL: 'replace_with_owner_google_email' }), null);
    assert.equal(readAccessConfig({ ...TEST_ENV, OWNER_EMAIL: 'person@example.com' }), null);
    assert.equal(readAccessConfig({ ...TEST_ENV, ACCESS_TEAM_DOMAIN: 'https://your-team.cloudflareaccess.com' }), null);
    assert.equal(readAccessConfig({ ...TEST_ENV, ACCESS_AUD: 'not-an-aud' }), null);
    assert.ok(readAccessConfig(TEST_ENV));
  });

  it('accepts an owner token and rejects the wrong Google account', async () => {
    const config = readAccessConfig(TEST_ENV);
    assert.ok(config);
    const owner = await signer.sign(ownerClaims(NOW));
    const other = await signer.sign(ownerClaims(NOW, 'Other@fixture.test'));
    const deps = { fetch: jwks(signer), now: () => NOW };
    assert.equal((await verifyAccessJwt(owner, config, deps))?.owner, true);
    const verified = await verifyAccessJwt(other, config, deps);
    assert.equal(verified?.owner, false);
    assert.equal(verified?.email, 'other@fixture.test');
  });

  it('fails closed for expiry, lifetime, audience, issuer, and bad signatures', async () => {
    const config = readAccessConfig(TEST_ENV);
    assert.ok(config);
    const deps = { fetch: jwks(signer), now: () => NOW };
    const expired = await signer.sign({ ...ownerClaims(NOW), exp: Math.floor(NOW / 1000) - 120 });
    const tooLong = await signer.sign({ ...ownerClaims(NOW), exp: Math.floor(NOW / 1000) + 40 * 24 * 60 * 60 });
    const early = await signer.sign({ ...ownerClaims(NOW), nbf: Math.floor(NOW / 1000) + 120 });
    const wrongAud = await signer.sign({ ...ownerClaims(NOW), aud: 'b'.repeat(64) });
    const wrongIss = await signer.sign({ ...ownerClaims(NOW), iss: 'https://evil.cloudflareaccess.com' });
    const otherKey = await makeAccessSigner('test-key');
    const forged = await otherKey.sign(ownerClaims(NOW));
    for (const token of [expired, tooLong, early, wrongAud, wrongIss, forged]) {
      assert.equal(await verifyAccessJwt(token, config, deps), null);
    }
  });

  it('rejects none and HMAC algorithms before verification', async () => {
    const config = readAccessConfig(TEST_ENV);
    assert.ok(config);
    const deps = { fetch: jwks(signer), now: () => NOW };
    const none = craft({ alg: 'none', kid: 'test-key' }, ownerClaims(NOW));
    const hmac = craft({ alg: 'HS256', kid: 'test-key' }, ownerClaims(NOW));
    const jku = await signer.sign(ownerClaims(NOW), { jku: 'https://evil.example/jwks' });
    assert.equal(await verifyAccessJwt(none, config, deps), null);
    assert.equal(await verifyAccessJwt(hmac, config, deps), null);
    assert.equal((await verifyAccessJwt(jku, config, deps))?.owner, true);
  });

  it('does not treat a service token or a failed JWKS fetch as the owner', async () => {
    const config = readAccessConfig(TEST_ENV);
    assert.ok(config);
    const service = await signer.sign({ ...ownerClaims(NOW), email: undefined, common_name: 'ci' });
    assert.equal((await verifyAccessJwt(service, config, { fetch: jwks(signer), now: () => NOW }))?.owner, false);
    clearJwksCache();
    const down = async () => new Response('no', { status: 500 });
    assert.equal(await verifyAccessJwt(await signer.sign(ownerClaims(NOW)), config, { fetch: down, now: () => NOW }), null);
  });

  it('refetches JWKS when the token key id is new', async () => {
    const config = readAccessConfig(TEST_ENV);
    assert.ok(config);
    let calls = 0;
    const fetch = async () => {
      calls += 1;
      const body = calls === 1 ? { keys: [] } : signer.jwks();
      if (calls === 1) return new Response(JSON.stringify({ keys: [{ kid: 'old', kty: 'RSA' }] }), { status: 200 });
      return new Response(JSON.stringify(body), { status: 200 });
    };
    const token = await signer.sign(ownerClaims(NOW));
    assert.equal((await verifyAccessJwt(token, config, { fetch, now: () => NOW }))?.owner, true);
    assert.equal(calls, 2);
  });

  it('ignores an email header and still accepts a valid cookie beside a bad header', async () => {
    const token = await signer.sign(ownerClaims(NOW));
    const deps = { fetch: jwks(signer), now: () => NOW };
    const spoof = new Request('https://funfun.zone/', {
      headers: { 'Cf-Access-Authenticated-User-Email': 'owner@fixture.test' },
    });
    assert.deepEqual(await identify(spoof, TEST_ENV, deps), { status: 'anonymous' });

    const both = new Request('https://funfun.zone/', {
      headers: {
        cookie: `theme=dark; CF_Authorization=${token}`,
        'Cf-Access-Jwt-Assertion': craft({ alg: 'none', kid: 'test-key' }, ownerClaims(NOW)),
      },
    });
    const identity = await identify(both, TEST_ENV, deps);
    assert.equal(identity.status, 'authenticated');
    if (identity.status === 'authenticated') assert.equal(identity.owner, true);
  });

  it('builds login and logout URLs without putting the owner email in them', () => {
    const config = readAccessConfig(TEST_ENV);
    assert.ok(config);
    const login = accessLoginUrl(config.issuer, config.aud, 'https://funfun.zone/auth/login/', '/posts/');
    assert.equal(
      login,
      `https://fixture-team.cloudflareaccess.com/cdn-cgi/access/login/funfun.zone?kid=${'a'.repeat(64)}&redirect_url=%2Fposts%2F`,
    );
    assert.doesNotMatch(login, /owner@fixture/);
    const logout = accessLogoutUrl('https://funfun.zone/auth/logout/');
    assert.equal(logout, 'https://funfun.zone/cdn-cgi/access/logout?returnTo=https%3A%2F%2Ffunfun.zone%2F');
    const request = new Request('https://funfun.zone/auth/login/?next=https://evil.example/phish');
    assert.equal(safeNextPath(request), '/');
    const same = new Request('https://funfun.zone/auth/login/?next=/private/hello/');
    assert.equal(safeNextPath(same), '/private/hello/');
  });
});

function jwks(signer: AccessSigner): typeof fetch {
  return (async () =>
    new Response(JSON.stringify(signer.jwks()), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })) as typeof fetch;
}

function craft(header: Record<string, unknown>, claims: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  return `${encode(header)}.${encode(claims)}.e30`;
}
