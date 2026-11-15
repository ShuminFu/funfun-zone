#!/usr/bin/env node
/**
 * Turn the figures in notes into files a browser can load well.
 *
 * Step 1, extract. A note written as a self-contained page carries its
 * figures as `<img src="data:image/...">`. That puts hundreds of kilobytes
 * in front of the first paragraph, cannot be cached, and cannot be
 * lazy-loaded. Each one is written to public/images/posts/<slug>/fig-NN.webp
 * and its tag rewritten with:
 *
 *   - the real width and height, so the page does not jump as images arrive
 *   - loading="lazy" and decoding="async"
 *   - a second, 800px-wide file and a srcset, so phones fetch the small one
 *
 * WebP sources are written byte for byte. PNG and JPEG are converted to
 * WebP. SVG and GIF are written as they are.
 *
 * Step 2, AVIF. Every figure under /images/posts/ gets an AVIF copy when
 * that copy is clearly smaller and still faithful, and its tag is wrapped:
 *
 *   <picture>
 *     <source type="image/avif" srcset="...avif">
 *     <img src="...webp" ...>          <- the fallback, and what older browsers load
 *   </picture>
 *
 * "Clearly smaller" is at most 85% of the WebP bytes. "Faithful" is a PSNR
 * of 40 dB or more against the pixels the WebP decodes to, tried at rising
 * quality until it is met. A figure that fails either test stays WebP only.
 *
 *   npm run images            # every note
 *   npm run images -- --dry   # report only
 *
 * Safe to run again: step 1 only touches tags that still hold a data URI,
 * step 2 only touches figures it has not judged yet (not inside a <picture>
 * and not marked data-avif="no"). AVIF encoding is slow, about 20 seconds
 * a figure, which is why the verdict is remembered.
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
const AVIF_MAX_SHARE = 0.85; // keep an AVIF only if it is at most this share of the WebP
const AVIF_MIN_PSNR = 40; // dB against the decoded WebP
const AVIF_QUALITIES = [52, 62, 72];

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path, out);
    else if (/\.mdx?$/.test(entry.name)) out.push(path);
  }
  return out;
}

const getAttr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))?.[1];
const setAttr = (tag, name, value) => {
  const attr = `${name}="${value}"`;
  const existing = new RegExp(`\\s${name}="[^"]*"`, 'i');
  return existing.test(tag) ? tag.replace(existing, ` ${attr}`) : tag.replace(/\s*\/?>$/, (end) => ` ${attr}${end.includes('/') ? ' />' : '>'}`);
};

/** Peak signal-to-noise ratio between two images of the same size, in dB. Higher is closer. */
async function psnr(reference, candidate) {
  const { data: a, info } = await sharp(reference).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(candidate).removeAlpha().resize(info.width, info.height, { fit: 'fill' }).raw().toBuffer();
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  const mse = sum / a.length;
  return mse === 0 ? 99 : 10 * Math.log10(255 ** 2 / mse);
}

/** The smallest AVIF that is still faithful to `pixels`, or null if none beats `budget` bytes. */
async function encodeAvif(pixels, budget) {
  for (const quality of AVIF_QUALITIES) {
    // 4:4:4 keeps the coloured edges of text and diagram lines sharp.
    const avif = await sharp(pixels).avif({ quality, effort: 6, chromaSubsampling: '4:4:4' }).toBuffer();
    if (avif.length > budget) return null; // a higher quality only gets bigger
    if ((await psnr(pixels, avif)) >= AVIF_MIN_PSNR) return avif;
  }
  return null;
}

const stats = { extracted: 0, htmlSaved: 0, avif: 0, avifSkipped: 0, webpBytes: 0, avifBytes: 0 };

/** Step 1: data URIs to files. Returns the rewritten source. */
async function extract(source, slug) {
  const tags = [...source.matchAll(/<img\b[^>]*\bsrc="data:image\/([a-z+.-]+);base64,([A-Za-z0-9+/=]+)"[^>]*>/gi)];
  if (!tags.length) return source;

  const dir = join(PUBLIC, 'images/posts', slug);
  const taken = existsSync(dir) ? (await readdir(dir)).map((f) => Number(f.match(/^fig-(\d+)[.-]/)?.[1] ?? 0)) : [];
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
    stats.extracted++;
    stats.htmlSaved += tag.length - newTag.length;
  }
  return out;
}

/** Step 2: AVIF copies and <picture> wrappers. Returns the rewritten source. */
async function addAvif(source) {
  let out = source;
  // Figures of ours that are not already the fallback inside a <picture>.
  const tags = [...source.matchAll(/(<picture>\s*(?:<source\b[^>]*>\s*)*)?(<img\b[^>]*\bsrc="(\/images\/posts\/[^"]+\.webp)"[^>]*>)/gi)];
  for (const [, inPicture, tag, src] of tags) {
    if (inPicture || getAttr(tag, 'data-avif') === 'no') continue;
    const fullPath = join(PUBLIC, src);
    if (!existsSync(fullPath)) continue; // dry run after an extract that wrote nothing

    const full = await readFile(fullPath);
    const smallSrc = getAttr(tag, 'srcset')?.match(/(\S+-\d+\.webp)\s+\d+w/)?.[1];
    const small = smallSrc && existsSync(join(PUBLIC, smallSrc)) ? await readFile(join(PUBLIC, smallSrc)) : null;

    // Encode from the pixels the reader would otherwise see: the decoded WebP.
    const avifFull = await encodeAvif(full, full.length * AVIF_MAX_SHARE);
    const avifSmall = small ? await encodeAvif(small, small.length * AVIF_MAX_SHARE) : null;
    // A srcset must offer the same widths in both formats, so it is both or neither.
    if (!avifFull || (small && !avifSmall)) {
      // Record the verdict on the tag: encoding takes about 20 s a figure,
      // and the answer will not change. Remove data-avif to try again.
      out = out.replace(tag, setAttr(tag, 'data-avif', 'no'));
      stats.avifSkipped++;
      continue;
    }

    const avifSrc = src.replace(/\.webp$/, '.avif');
    const width = getAttr(tag, 'width');
    const sources = small
      ? `${smallSrc.replace(/\.webp$/, '.avif')} ${SMALL}w, ${avifSrc} ${width}w`
      : avifSrc;
    const sizes = small ? ` sizes="${getAttr(tag, 'sizes') ?? SIZES}"` : '';
    const picture = `<picture><source type="image/avif" srcset="${sources}"${sizes}>${tag}</picture>`;

    if (!dry) {
      await writeFile(join(PUBLIC, avifSrc), avifFull);
      if (small) await writeFile(join(PUBLIC, smallSrc.replace(/\.webp$/, '.avif')), avifSmall);
    }
    out = out.replace(tag, picture);
    stats.avif++;
    stats.webpBytes += full.length + (small?.length ?? 0);
    stats.avifBytes += avifFull.length + (avifSmall?.length ?? 0);
  }
  return out;
}

for (const file of (await walk(POSTS)).sort()) {
  const source = await readFile(file, 'utf8');
  if (!/<img\b[^>]*\bsrc="(?:data:image\/|\/images\/posts\/)/i.test(source)) continue;

  const slug = relative(POSTS, file).replace(/\.mdx?$/, '');
  const before = { ...stats };
  let out = await extract(source, slug);
  out = await addAvif(out);
  if (out === source) continue;
  if (!dry) await writeFile(file, out);
  console.log(`${slug}: ${stats.extracted - before.extracted} extracted, ${stats.avif - before.avif} given AVIF, ${stats.avifSkipped - before.avifSkipped} left as WebP`);
}

const kb = (n) => `${Math.round(n / 1024)} KB`;
if (stats.extracted) console.log(`\n${dry ? 'Would move' : 'Moved'} ${stats.extracted} image(s) out of the HTML; notes are ${kb(stats.htmlSaved)} lighter.`);
if (stats.avif) console.log(`AVIF for ${stats.avif} figure(s): ${kb(stats.webpBytes)} as WebP, ${kb(stats.avifBytes)} as AVIF (${Math.round((1 - stats.avifBytes / stats.webpBytes) * 100)}% smaller).`);
if (stats.avifSkipped) console.log(`${stats.avifSkipped} figure(s) stay WebP only: AVIF was not at least 15% smaller at the same fidelity.`);
if (!stats.extracted && !stats.avif && !stats.avifSkipped) console.log('Nothing to do.');
