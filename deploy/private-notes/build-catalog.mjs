/**
 * Turns markdown files in a private repository into catalog.json.
 * The public site does not run this, and this repository has no notes to read.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PLANTED = /^\d{4}-\d{2}-\d{2}$/;
const MAX_BODY = 100_000;
const MAX_TITLE = 200;

export function buildCatalog(notesDir) {
  /** @type {{ slug: string, title: string, planted: string, body: string }[]} */
  const notes = [];
  if (!fs.existsSync(notesDir)) return { notes };
  for (const name of fs.readdirSync(notesDir)) {
    if (!name.endsWith('.md') || name === 'README.md') continue;
    const slug = name.slice(0, -'.md'.length);
    if (!SLUG.test(slug)) continue;
    const parsed = parseNote(fs.readFileSync(path.join(notesDir, name), 'utf8'));
    if (!parsed) continue;
    notes.push({ slug, ...parsed });
  }
  notes.sort((a, b) => b.planted.localeCompare(a.planted) || a.slug.localeCompare(b.slug));
  return { notes };
}

function parseNote(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return null;
  /** @type {Record<string, string>} */
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const split = line.indexOf(':');
    if (split === -1) continue;
    data[line.slice(0, split).trim()] = line.slice(split + 1).trim();
  }
  const title = (data.title ?? '').replace(/[\r\n]+/g, ' ').trim();
  const planted = data.planted ?? '';
  const body = match[2] ?? '';
  if (!title || title.length > MAX_TITLE || !PLANTED.test(planted) || body.length > MAX_BODY) return null;
  return { title, planted, body };
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  const root = path.dirname(fileURLToPath(import.meta.url));
  const catalog = buildCatalog(path.join(root, 'notes'));
  fs.writeFileSync(path.join(root, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
}
