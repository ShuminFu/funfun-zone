#!/usr/bin/env node
/**
 * Move base64 images out of notes and into files.
 *
 * A note written as a self-contained page carries its figures as
 * `<img src="data:image/...">`. That puts hundreds of kilobytes in front of
 * the first paragraph, cannot be cached, and cannot be lazy-loaded. This
 * script writes each one to public/images/posts/<slug>/fig-NN.webp and
 * rewrites the tag to point at it, with:
 *
 *   - the real width and height, so the page does not jump as images arrive
 *   - loading="lazy" and decoding="async"
 *   - a second, 800px-wide file and a srcset, so phones fetch the small one
 *
 * WebP sources are written byte for byte (no recompression). PNG and JPEG
 * are converted to WebP. SVG and GIF are written as they are.
 *
 *   npm run images            # every note
 *   npm run images -- --dry   # report only
 *
 * Safe to run again: it only touches tags that still hold a data URI, and
 * numbering continues after the files a note already has.
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = join(ROOT, 'src/content/posts');
const PUBLIC = join(ROOT, 'public');
const dry = process.argv.includes('--dry');
const SMALL = 800; // px; covers a phone at 2x
const SIZES = '(max-width: 768px) 100vw, 760px';

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path, out);
    else if (/\.mdx?$/.test(entry.name)) out.push(path);
  }
  return out;
}

const setAttr = (tag, name, value) => {
  const attr = `${name}="${value}"`;
  const existing = new RegExp(`\\s${name}="[^"]*"`, 'i');
  return existing.test(tag) ? tag.replace(existing, ` ${attr}`) : tag.replace(/\s*\/?>$/, (end) => ` ${attr}${end.includes('/') ? ' />' : '>'}`);
};

let moved = 0;
let savedBytes = 0;
for (const file of (await walk(POSTS)).sort()) {
  const source = await readFile(file, 'utf8');
  const tags = [...source.matchAll(/<img\b[^>]*\bsrc="data:image\/([a-z+.-]+);base64,([A-Za-z0-9+/=]+)"[^>]*>/gi)];
  if (!tags.length) continue;

  const slug = relative(POSTS, file).replace(/\.mdx?$/, '');
  const dir = join(PUBLIC, 'images/posts', slug);
  const taken = existsSync(dir) ? (await readdir(dir)).map((f) => Number(f.match(/^fig-(\d+)\./)?.[1] ?? 0)) : [];
  let next = Math.max(0, ...taken) + 1;
  let out = source;

  for (const [tag, type, data] of tags) {
    const input = Buffer.from(data, 'base64');
    const name = `fig-${String(next++).padStart(2, '0')}`;
    const url = (suffix, ext) => `/images/posts/${slug}/${name}${suffix}.${ext}`;
    let newTag = tag;
    const files = [];

    if (type === 'svg+xml' || type === 'gif') {
      const ext = type === 'gif' ? 'gif' : 'svg';
      files.push([url('', ext), input]);
      newTag = newTag.replace(/\bsrc="data:[^"]*"/i, `src="${url('', ext)}"`);
    } else {
      const meta = await sharp(input).metadata();
      const full = type === 'webp' ? input : await sharp(input).webp({ quality: 86 }).toBuffer();
      files.push([url('', 'webp'), full]);
      newTag = newTag.replace(/\bsrc="data:[^"]*"/i, `src="${url('', 'webp')}"`);
      if (meta.width > SMALL * 1.25) {
        const small = await sharp(input).resize({ width: SMALL }).webp({ quality: 82 }).toBuffer();
        // Only worth a second file if it is meaningfully smaller.
        if (small.length < full.length * 0.8) {
          files.push([url(`-${SMALL}`, 'webp'), small]);
          newTag = setAttr(newTag, 'srcset', `${url(`-${SMALL}`, 'webp')} ${SMALL}w, ${url('', 'webp')} ${meta.width}w`);
          newTag = setAttr(newTag, 'sizes', SIZES);
        }
      }
      newTag = setAttr(newTag, 'width', meta.width);
      newTag = setAttr(newTag, 'height', meta.height);
    }
    newTag = setAttr(newTag, 'loading', 'lazy');
    newTag = setAttr(newTag, 'decoding', 'async');

    if (!dry) {
      await mkdir(dir, { recursive: true });
      for (const [path, bytes] of files) await writeFile(join(PUBLIC, path), bytes);
    }
    out = out.replace(tag, newTag);
    moved++;
    savedBytes += tag.length - newTag.length;
  }

  if (!dry) await writeFile(file, out);
  console.log(`${slug}: ${tags.length} image(s) -> public/images/posts/${slug}/`);
}
console.log(moved ? `\n${dry ? 'Would move' : 'Moved'} ${moved} image(s); notes are ${Math.round(savedBytes / 1024)} KB lighter.` : 'No base64 images found.');
