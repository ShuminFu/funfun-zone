/** Test-only key pair. Nothing here is a deployed secret. */

export interface AccessSigner {
  sign(claims: Record<string, unknown>, header?: Record<string, unknown>): Promise<string>;
  jwks(): { keys: JsonWebKey[] };
}

export async function makeAccessSigner(kid = 'test-key'): Promise<AccessSigner> {
  const pair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  );
  const exported = await crypto.subtle.exportKey('jwk', pair.publicKey);
  const { kty, n, e } = exported;
  const publicJwk = { kty, n, e, kid, alg: 'RS256', use: 'sig' };

  return {
    jwks: () => ({ keys: [publicJwk] }),
    async sign(claims, header = {}) {
      const encodedHeader = base64Url(JSON.stringify({ alg: 'RS256', kid, typ: 'JWT', ...header }));
      const encodedClaims = base64Url(JSON.stringify(claims));
      const data = new TextEncoder().encode(`${encodedHeader}.${encodedClaims}`);
      const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, data);
      return `${encodedHeader}.${encodedClaims}.${base64Url(signature)}`;
    },
  };
}

function base64Url(value: string | ArrayBuffer): string {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

export const TEST_ENV = {
  ACCESS_TEAM_DOMAIN: 'https://fixture-team.cloudflareaccess.com',
  ACCESS_AUD: 'a'.repeat(64),
  OWNER_EMAIL: 'owner@fixture.test',
  PRIVATE_NOTES_ORIGIN: 'https://private-notes.fixture.test',
};

export const FIXTURE_NOTE_BODY = 'FIXTURE_PRIVATE_NOTE_BODY';

export function ownerClaims(now = Date.now(), email = 'owner@fixture.test'): Record<string, unknown> {
  return {
    iss: 'https://fixture-team.cloudflareaccess.com',
    aud: 'a'.repeat(64),
    exp: Math.floor(now / 1000) + 60 * 60,
    nbf: Math.floor(now / 1000) - 60,
    email,
    sub: 'fixture-subject',
    type: 'app',
  };
}
