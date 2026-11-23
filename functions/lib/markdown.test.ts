import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { renderMarkdown } from './markdown.ts';

describe('private note markdown', () => {
  it('escapes raw html and refuses unsafe links', () => {
    const html = renderMarkdown(
      'Hello <script>alert(1)</script>\n\n[ok](https://example.com/a)\n\n[bad](javascript:alert(1))\n\n![pic](javascript:alert(2))\n\n[note](my-note)',
    );
    assert.match(html, /Hello &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.doesNotMatch(html, /<script>/);
    assert.match(html, /href="https:\/\/example.com\/a"/);
    assert.doesNotMatch(html, /href="javascript:/);
    assert.doesNotMatch(html, /<img/);
    assert.match(html, /href="\/private\/my-note\/"/);
  });

  it('renders the small set of blocks a note needs', () => {
    const html = renderMarkdown('# Title\n\n- one\n- two\n\n```\nconst x = 1 < 2;\n```');
    assert.match(html, /<h1>Title<\/h1>/);
    assert.match(html, /<ul><li>one<\/li><li>two<\/li><\/ul>/);
    assert.match(html, /const x = 1 &lt; 2;/);
  });
});
