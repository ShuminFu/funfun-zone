import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { privateSurfaceOpen, readPrivateOrigin } from './origin.ts';

describe('private origin', () => {
  it('accepts only an https host that is not this site', () => {
    const origin = readPrivateOrigin('https://private-notes.fixture.test', 'funfun.zone');
    assert.equal(origin?.href, 'https://private-notes.fixture.test/');
    for (const value of [
      'http://private-notes.fixture.test',
      'https://user:pass@private-notes.fixture.test',
      'https://funfun.zone',
      'https://127.0.0.1',
      'https://169.254.169.254',
      'https://10.1.1.1',
      'https://example.com',
      'https://private-notes.fixture.test/notes',
      'https://REPLACE_WITH_PRIVATE_ORIGIN',
    ]) {
      assert.equal(readPrivateOrigin(value, 'funfun.zone'), null, value);
    }
    assert.equal(readPrivateOrigin('https://private-notes.fixture.test', 'private-notes.fixture.test'), null);
  });

  it('keeps pages.dev closed unless a deployment explicitly opts in', () => {
    assert.equal(privateSurfaceOpen('funfun.zone', {}), true);
    assert.equal(privateSurfaceOpen('funfun-zone.pages.dev', {}), false);
    assert.equal(privateSurfaceOpen('preview.funfun-zone.pages.dev', { PRIVATE_NOTES_ALLOW_PREVIEW: 'true' }), true);
    assert.equal(privateSurfaceOpen('127.0.0.1', {}), false);
  });
});
