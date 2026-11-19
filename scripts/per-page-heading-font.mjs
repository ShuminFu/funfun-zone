#!/usr/bin/env node
/**
 * Give every built page its own small Chinese heading font.
 *
 * One site-wide subset holds every heading character on the site (~800
 * glyphs, ~140 KB), but a single page shows only 50-100 of them. A reader who
 * opens one post should not download the rest. So after `astro build` this
 * script reads each HTML page in dist/, collects the Chinese characters its
 * headings use, writes a font with just those, and adds the @font-face to that
 * page's <head>.
 *
 * Pages with the same character set share one file, and file names are
 * content hashes, so the browser cache still works across pages.
 *
 * No preloads: in a slow-4G test, preloading fonts delayed first paint by
 * 100-350 ms because they competed with the CSS. Layout shift from late fonts
 * is handled by size-matched fallbacks in global.css instead.
 *
 * The site-wide font is still built for `npm run dev`
 * (scripts/subset-heading-font.mjs); in a production build that script writes
 * an empty stylesheet instead, so the big file never ships.
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SOURCE = join(ROOT, 'node_modules/@fontsource/noto-serif-sc/files/noto-serif-sc-chinese-simplified-600-normal.woff2');
const OUT = '_astro/hf';
const WANTED = /[⺀-⿟　-〿㐀-䶿一-鿿豈-﫿︰-﹏＀-￯]/g;
const UNICODE_RANGE = 'U+2E80-2FDF, U+3000-303F, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF, U+FE30-FE4F, U+FF00-FFEF';
// Punctuation that headings commonly use; cheap, and saves a fallback flash.
const ALWAYS = '，。、；：？！“”‘’（）《》「」『』【】—…·｜';

async function htmlFiles(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await htmlFiles(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

/** Chinese characters that the page sets in the heading font. */
function headingChars(html) {
  const body = html.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, '');
  const parts = [];
  for (const m of body.matchAll(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/gi)) parts.push(m[1]);
  // Embedded notes and the drop cap set a few other elements in the heading font.
  for (const m of body.matchAll(/class="[^"]*\b(?:title|kicker|hd|lede|big|drop-cap)\b[^"]*"[^>]*>([^<]{1,120})</gi)) parts.push(m[1]);
  const text = parts.join('').replace(/<[^>]+>/g, '');
  const set = new Set(text.match(WANTED) ?? []);
  if (set.size === 0) return '';
  for (const c of ALWAYS) set.add(c);
  return [...set].sort().join('');
}

const source = await readFile(SOURCE);
await mkdir(join(DIST, OUT), { recursive: true });
const made = new Map(); // chars -> url
let pages = 0, bytes = 0, maxBytes = 0;

for (const file of await htmlFiles(DIST)) {
  const html = await readFile(file, 'utf8');
  if (!html.includes('</head>')) continue;
  const chars = headingChars(html);
  if (!chars) continue;
  let entry = made.get(chars);
  if (!entry) {
    const font = await subsetFont(source, chars, { targetFormat: 'woff2' });
    const name = createHash('sha256').update(font).digest('hex').slice(0, 10) + '.woff2';
    await writeFile(join(DIST, OUT, name), font);
    entry = { url: `/${OUT}/${name}`, size: font.length };
    made.set(chars, entry);
  }
  const head =
    `<style>@font-face{font-family:'Noto Serif SC';font-style:normal;font-weight:600;font-display:swap;` +
    `src:url(${entry.url}) format('woff2');unicode-range:${UNICODE_RANGE}}</style>`;
  await writeFile(file, html.replace('</head>', head + '</head>'));
  pages += 1; bytes += entry.size; maxBytes = Math.max(maxBytes, entry.size);
}

console.log(`per-page heading font: ${pages} pages, ${made.size} files, avg ${Math.round(bytes / Math.max(pages, 1) / 1024)} KB, max ${Math.round(maxBytes / 1024)} KB`);
