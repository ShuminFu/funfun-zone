import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { buildCatalog } from './build-catalog.mjs';

describe('private catalog build', () => {
  it('reads a temporary directory and ignores unsafe filenames', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'private-notes-'));
    fs.writeFileSync(path.join(dir, 'README.md'), 'do not publish\n');
    fs.writeFileSync(path.join(dir, 'Hello World.md'), '---\ntitle: No\nplanted: 2026-01-01\n---\nnope\n');
    fs.writeFileSync(
      path.join(dir, 'fixture-note.md'),
      '---\ntitle: Fixture\nplanted: 2026-11-01\n---\n<script>alert(1)</script>\n',
    );
    const catalog = buildCatalog(dir);
    assert.deepEqual(catalog.notes, [
      {
        slug: 'fixture-note',
        title: 'Fixture',
        planted: '2026-11-01',
        body: '<script>alert(1)</script>\n',
      },
    ]);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('sees no notes in this public repository', () => {
    const notesDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'notes');
    assert.deepEqual(buildCatalog(notesDir), { notes: [] });
  });
});
