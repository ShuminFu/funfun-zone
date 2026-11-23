import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { describe, it } from 'node:test';
import { applyChrome } from './chrome.ts';

const built = 'dist/index.html';

describe('built header', () => {
  it('keeps the private entry out of the static page and accepts an owner injection', () => {
    if (!existsSync(built)) return;
    const html = readFileSync(built, 'utf8');
    assert.equal(html.includes('href="/private/"'), false);
    assert.equal(html.includes('Private Notes'), false);
    assert.match(html, /data-auth="sign-in"/);
    const owner = applyChrome(html, 'owner', '/');
    assert.equal((owner.match(/href="\/private\/"/g) ?? []).length, 2);
    assert.match(owner, />Sign out</);
    const reader = applyChrome(html, 'signed-in', '/');
    assert.equal(reader.includes('href="/private/"'), false);
    assert.match(reader, />Sign out</);
  });
});
