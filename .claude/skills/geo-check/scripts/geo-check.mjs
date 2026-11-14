#!/usr/bin/env node
// Check the built site (dist/) for the signals answer engines and agents
// read. Run `npm run build` first. Exit code 1 if a check fails.
//
//   node .claude/skills/geo-check/scripts/geo-check.mjs [dist]

import fs from 'node:fs';
import path from 'node:path';

const dist = process.argv[2] ?? 'dist';
if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error(`${dist}/index.html not found. Run "npm run build" first.`);
  process.exit(2);
}

let failures = 0;
const warnings = [];
const ok = (msg) => console.log(`  ok    ${msg}`);
const fail = (msg) => { failures++; console.log(`  FAIL  ${msg}`); };
const read = (p) => fs.readFileSync(path.join(dist, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(dist, p));

// Every note is a directory with an index.html under dist/posts, except the
// listing routes.
function notePages(dir = 'posts', out = []) {
  for (const entry of fs.readdirSync(path.join(dist, dir), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const rel = path.join(dir, entry.name);
    if (rel === 'posts/page' || rel === 'posts/tag') continue;
    if (exists(path.join(rel, 'index.html'))) out.push(rel);
    notePages(rel, out);
  }
  return out;
}
const notes = notePages();
const meta = (html, attr, name) =>
  html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))?.[1];
const jsonLd = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const types = (blocks) => blocks.flatMap((b) => (b['@graph'] ?? [b]).map((n) => n['@type']));

console.log('\nSite files');
for (const file of ['robots.txt', 'sitemap-index.xml', 'feed.xml', 'llms.txt', '404.html', 'og-default.png']) {
  exists(file) ? ok(file) : fail(`${file} is missing`);
}
if (exists('robots.txt')) {
  const robots = read('robots.txt');
  /Sitemap:/i.test(robots) ? ok('robots.txt names the sitemap') : fail('robots.txt has no Sitemap line');
  if (/Disallow:\s*\/\s*$/m.test(robots)) fail('robots.txt disallows the whole site for some agent');
  if (!/Content-Signal:/i.test(robots)) warnings.push('robots.txt has no Content-Signal line. That is a policy choice for the owner, not a defect.');
}

console.log('\nllms.txt');
if (exists('llms.txt')) {
  const llms = read('llms.txt');
  /^# .+/.test(llms) && /^> .+/m.test(llms) ? ok('has a title and a summary line') : fail('needs "# Name" and a "> summary" line');
  const listed = new Set([...llms.matchAll(/\/posts\/([^)\s]+)\.md\)/g)].map((m) => `posts/${m[1]}`));
  const missing = notes.filter((n) => !listed.has(n));
  missing.length ? fail(`${missing.length} note(s) not listed: ${missing.slice(0, 5).join(', ')}`) : ok(`lists all ${notes.length} notes`);
}

console.log(`\nNotes (${notes.length})`);
const problems = {};
const note = (key, page) => (problems[key] ??= []).push(page);
for (const page of notes) {
  const html = read(path.join(page, 'index.html'));
  if (/<meta name="robots" content="noindex/.test(html)) continue;
  const lang = html.match(/<html lang="([^"]*)"/)?.[1];
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const hasCjk = /[㐀-鿿]/.test(title.split('|')[0]);
  if (!lang) note('no <html lang>', page);
  else if (hasCjk !== lang.startsWith('zh')) note(`<html lang> does not match the title's language`, page);
  if (!meta(html, 'name', 'description')) note('no meta description', page);
  if (!meta(html, 'name', 'author')) note('no meta author', page);
  if (!/<link rel="canonical"/.test(html)) note('no canonical link', page);
  if (meta(html, 'property', 'og:type') !== 'article') note('og:type is not "article"', page);
  if (!meta(html, 'property', 'article:published_time')) note('no article:published_time', page);
  const image = meta(html, 'property', 'og:image');
  if (!image) note('no og:image', page);
  else if (image.startsWith('https://funfun.zone/') && !exists(new URL(image).pathname)) note('og:image file does not exist', page);
  if (!/<time[^>]+datetime=/.test(html)) note('no <time datetime>', page);
  if (!/<link rel="alternate" type="text\/markdown"/.test(html) || !exists(`${page}.md`)) note('no Markdown copy', page);
  let blocks = [];
  try { blocks = jsonLd(html); } catch { note('JSON-LD does not parse', page); }
  const found = types(blocks);
  for (const type of ['BlogPosting', 'BreadcrumbList', 'WebSite', 'Person']) {
    if (!found.includes(type)) note(`no ${type} JSON-LD`, page);
  }
  const posting = blocks.find((b) => b['@type'] === 'BlogPosting');
  if (posting) {
    for (const field of ['headline', 'datePublished', 'dateModified', 'author', 'inLanguage', 'image']) {
      if (!posting[field]) note(`BlogPosting has no ${field}`, page);
    }
    if (!posting.description) (warnings.push(`${page}: no description in frontmatter (used for meta, JSON-LD and llms.txt)`));
  }
}
const keys = Object.keys(problems);
if (!keys.length) ok('every note has language, author, dates, image, Markdown copy and structured data');
for (const key of keys) fail(`${key}: ${problems[key].length} note(s), e.g. ${problems[key].slice(0, 3).join(', ')}`);

console.log('\nOther pages');
for (const page of ['index.html', 'about/index.html', 'posts/index.html']) {
  const html = read(page);
  let found = [];
  try { found = types(jsonLd(html)); } catch { fail(`${page}: JSON-LD does not parse`); }
  found.includes('WebSite') && found.includes('Person') ? ok(`${page} has WebSite and Person JSON-LD`) : fail(`${page} lacks WebSite/Person JSON-LD`);
}

if (warnings.length) {
  console.log('\nWorth a look (not failures)');
  for (const w of warnings.slice(0, 12)) console.log(`  -     ${w}`);
  if (warnings.length > 12) console.log(`  -     and ${warnings.length - 12} more`);
}
console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks pass');
process.exitCode = failures ? 1 : 0;
