#!/usr/bin/env node
// Review every note the way a reader meets it. Two passes:
//
//   source   reads src/content/posts: description, headings, images, links,
//            page weight. No browser needed.
//   render   opens each built note at phone and desktop width, in light and
//            dark, and measures what a reader would trip over: sideways
//            scroll, unreadable text, broken images, script errors.
//
//   npm run build && npx astro preview --port 4329 &
//   node .claude/skills/post-review/scripts/post-audit.mjs                 # both passes
//   node .claude/skills/post-review/scripts/post-audit.mjs --source        # source pass only
//   node .claude/skills/post-review/scripts/post-audit.mjs --only clash-dns-system-deadlock
//   node .claude/skills/post-review/scripts/post-audit.mjs --json out.json --shots dir
//
// The render pass needs Playwright with Chromium. It is not a dependency of
// this repo: set PLAYWRIGHT=/path/to/node_modules/playwright if needed.
// BASE_URL overrides http://127.0.0.1:4329. Exit code 1 if any note has a
// finding marked as a defect; "notes" are for the author and do not fail.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const POSTS = 'src/content/posts';
const base = process.env.BASE_URL || 'http://127.0.0.1:4329';
const only = value('--only');

function listPosts(dir = POSTS, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) listPosts(p, out);
    else if (/\.mdx?$/.test(entry.name)) out.push(p);
  }
  return out.sort();
}

const posts = listPosts()
  .map((file) => {
    const raw = fs.readFileSync(file, 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---\n?/);
    const front = fm ? fm[1] : '';
    const field = (k) => front.match(new RegExp(`^${k}:\\s*["']?(.*?)["']?\\s*$`, 'm'))?.[1];
    return {
      id: path.relative(POSTS, file).replace(/\.mdx?$/, ''),
      file,
      title: field('title') ?? '',
      description: field('description') ?? '',
      draft: field('draft') === 'true',
      body: fm ? raw.slice(fm[0].length) : raw,
    };
  })
  .filter((p) => !p.draft && (!only || p.id === only));
const ids = new Set(listPosts().map((f) => path.relative(POSTS, f).replace(/\.mdx?$/, '')));

const findings = Object.fromEntries(posts.map((p) => [p.id, { defects: [], notes: [] }]));
const defect = (id, text) => findings[id].defects.push(text);
const note = (id, text) => findings[id].notes.push(text);

// ---------------------------------------------------------------- source pass
const plain = (s) =>
  s
    .replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>|<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|~-]/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const squash = (s) => s.replace(/[\s\p{P}\p{S}]/gu, '').toLowerCase();

/** Same rule as src/utils/reading.ts: about 400 Chinese characters or 230 English words a minute. */
function readingMinutes(text) {
  const cjk = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const words = (text.replace(/[\u3400-\u9fff]/g, ' ').match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length;
  return Math.max(1, Math.round(cjk / 400 + words / 230));
}

for (const p of posts) {
  // Shell comments inside <pre> start with "# " and are not headings.
  const noCode = p.body
    .replace(/```[\s\S]*?```/g, '\u0000')
    .replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<(pre|code|textarea)\b[\s\S]*?<\/\1>/gi, '\u0000');
  const text = plain(p.body);

  if (!p.description) defect(p.id, 'no description: the card, the search result and the social preview have nothing to show');
  else {
    // The layout drops its own copy when the body opens with the description
    // (utils/reading.ts). Check the built page, so a regression there shows up.
    const lede = squash(text.slice(0, p.description.length + 60));
    const page = path.join('dist/posts', p.id, 'index.html');
    if (lede.startsWith(squash(p.description)) && fs.existsSync(page)) {
      const header = fs.readFileSync(page, 'utf8').match(/<header class="mb-8">([\s\S]*?)<\/header>/)?.[1] ?? '';
      if (squash(plain(header)).includes(squash(p.description))) defect(p.id, 'the description is printed under the title and again as the first line of the body');
    }
  }

  // Headings, in document order, from Markdown and from embedded HTML.
  const heads = [];
  for (const m of noCode.matchAll(/^(#{1,6})\s+(.*)$|<h([1-6])\b[^>]*>([\s\S]*?)<\/h\3>/gim)) {
    heads.push({ level: m[1] ? m[1].length : Number(m[3]), text: plain(m[2] ?? m[4]), index: m.index, md: Boolean(m[1]), len: m[0].length });
  }
  if (heads.some((h) => h.level === 1)) defect(p.id, 'a second H1 in the body; the layout already prints the title as the H1');
  for (let i = 1; i < heads.length; i++) {
    if (heads[i].level - heads[i - 1].level > 1) {
      note(p.id, `heading level jumps from H${heads[i - 1].level} to H${heads[i].level} at "${heads[i].text.slice(0, 30)}"`);
      break;
    }
  }
  for (let i = 0; i < heads.length; i++) {
    const end = i + 1 < heads.length ? heads[i + 1].index : noCode.length;
    const raw = noCode.slice(heads[i].index + heads[i].len, end);
    // <pre>, <code> and images were blanked above; a marker left in their place counts as content.
    const hasContent = plain(raw) || /\u0000|<img|<figure|<table|!\[/i.test(raw);
    const sameOrHigher = i + 1 >= heads.length || heads[i + 1].level <= heads[i].level;
    if (!hasContent && sameOrHigher) defect(p.id, `empty section: the heading "${heads[i].text.slice(0, 40)}" has nothing under it`);
  }

  const imgs = [...p.body.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const noAlt = imgs.filter((tag) => !/\balt="[^"]+"/i.test(tag)).length + (p.body.match(/!\[\]\(/g) || []).length;
  if (noAlt) note(p.id, `${noAlt} of ${imgs.length} image(s) have no alt text; a screen reader and the Markdown copy get nothing`);

  for (const m of p.body.matchAll(/(?:href="|\]\()\/posts\/([^"#)?]+?)\/?(?:[#?][^")]*)?["\)]/g)) {
    if (!ids.has(m[1]) && !m[1].startsWith('tag/')) defect(p.id, `link to /posts/${m[1]}/ goes nowhere`);
  }
  if (/\]\(\s*\)|href="#?"/.test(noCode)) note(p.id, 'a link with an empty target');

  const built = path.join('dist/posts', p.id, 'index.html');
  if (fs.existsSync(built)) {
    const kb = Math.round(fs.statSync(built).size / 1024);
    if (kb > 600) note(p.id, `the page is ${kb} KB of HTML because images are embedded as base64; it loads slowly on a phone connection`);
    const shown = fs.readFileSync(built, 'utf8').match(/(\d+) min read/)?.[1];
    const real = readingMinutes(text);
    if (shown && Math.abs(Number(shown) - real) >= Math.max(2, real * 0.5)) defect(p.id, `reading time says ${shown} min, a reader needs about ${real}`);
  }
}

// ---------------------------------------------------------------- render pass
if (!flag('--source')) {
  const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || 'playwright');
  const shots = value('--shots');
  if (shots) fs.mkdirSync(shots, { recursive: true });
  const browser = await chromium.launch();
  const views = [
    ['phone', 390, 800, 'light'],
    ['phone', 390, 800, 'dark'],
    ['desktop', 1280, 900, 'light'],
    ['desktop', 1280, 900, 'dark'],
  ];
  for (const [size, width, height, mode] of views) {
    const context = await browser.newContext({ viewport: { width, height } });
    await context.addInitScript((m) => { try { localStorage.setItem('theme', m); } catch {} }, mode);
    const page = await context.newPage();
    let errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const p of posts) {
      errors = [];
      const where = `${size}, ${mode}`;
      try {
        await page.goto(`${base}/posts/${p.id}/`, { waitUntil: 'load', timeout: 45000 });
      } catch (e) {
        defect(p.id, `${where}: the page did not load (${e.message.split('\n')[0]})`);
        continue;
      }
      await page.waitForTimeout(350);
      const r = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const article = document.querySelector('article') ?? document.body;
        const out = { overflow: document.documentElement.scrollWidth - vw, wide: [], brokenImages: 0, lowContrast: [], tiny: 0, textCount: 0 };

        const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
        const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
        const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
        // The colour actually behind an element, or null when it cannot be known (image, gradient).
        const backdrop = (el) => {
          const layers = [];
          for (let n = el; n; n = n.parentElement) {
            const s = getComputedStyle(n);
            if (s.backgroundImage !== 'none') return null;
            const c = parse(s.backgroundColor);
            if (c && c.a > 0) { layers.push(c); if (c.a === 1) break; }
          }
          let bg = { r: 255, g: 255, b: 255, a: 1 };
          for (const c of layers.reverse()) bg = over(c, bg);
          return bg;
        };

        for (const el of article.querySelectorAll('*')) {
          if (el.closest('script, style, .copy-code-btn, [aria-hidden="true"]')) continue;
          if (el.tagName !== 'svg' && el.closest('svg')) continue;
          const rect = el.getBoundingClientRect();
          if (!rect.width || !rect.height) continue;
          const style = getComputedStyle(el);
          if (style.visibility === 'hidden' || Number(style.opacity) === 0) continue;

          // Wider than the screen. Fine inside its own sideways scroller; a
          // defect when an ancestor cuts it off or when it widens the page.
          if (rect.right > vw + 2 && rect.width > 40 && /^(TABLE|PRE|IMG|FIGURE|svg|VIDEO|IFRAME)$/.test(el.tagName)) {
            let fate = 'widens the page';
            const self = style.overflowX;
            if (self === 'auto' || self === 'scroll') fate = null;
            for (let n = el.parentElement; fate && n && n !== document.documentElement; n = n.parentElement) {
              const o = getComputedStyle(n).overflowX;
              if (o === 'auto' || o === 'scroll') fate = null;
              else if (o === 'hidden' || o === 'clip') { fate = 'is cut off'; break; }
            }
            if (fate && out.wide.length < 3) out.wide.push(`${el.tagName.toLowerCase()} ${Math.round(rect.width)}px ${fate}`);
          }

          if (el.tagName === 'svg') continue;
          const ownText = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim().length > 1).map((n) => n.textContent.trim()).join(' ');
          if (!ownText) continue;
          out.textCount++;
          const size = parseFloat(style.fontSize);
          if (size < 11) out.tiny++;
          const fg = parse(style.color);
          const bg = backdrop(el);
          if (!fg || !bg) continue;
          const c = ratio(over(fg, bg), bg) ;
          // Large text needs 3:1, everything else 4.5:1 (WCAG AA).
          const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
          if (c < (large ? 3 : 4.5) && out.lowContrast.length < 60) out.lowContrast.push({ c: Math.round(c * 100) / 100, t: ownText.slice(0, 28), fg: style.color, cls: (el.closest('[class]')?.className || '').toString().split(' ')[0] });
        }
        for (const img of article.querySelectorAll('img')) if (img.complete && img.naturalWidth === 0) out.brokenImages++;
        return out;
      });

      if (r.overflow > 2) defect(p.id, `${where}: the page scrolls sideways by ${r.overflow}px${r.wide.length ? ` (${r.wide.join(', ')})` : ''}`);
      else if (r.wide.length) defect(p.id, `${where}: content wider than the screen ${r.wide.join(', ')}`);
      if (r.brokenImages) defect(p.id, `${where}: ${r.brokenImages} image(s) do not load`);
      if (errors.length) defect(p.id, `${where}: script error: ${errors[0].slice(0, 120)}`);
      if (r.lowContrast.length) {
        const worst = r.lowContrast.sort((a, b) => a.c - b.c)[0];
        const share = Math.round((r.lowContrast.length / Math.max(1, r.textCount)) * 100);
        // A handful of faint captions is a note; a large share of the text is a defect.
        (r.lowContrast.length >= 8 || worst.c < 2 ? defect : note)(
          p.id,
          `${where}: ${r.lowContrast.length} text element(s) are hard to read (${share}% of the text); worst is ${worst.c}:1 on "${worst.t}"${worst.cls ? ` in .${worst.cls}` : ''}`
        );
      }
      if (r.tiny >= 5) note(p.id, `${where}: ${r.tiny} text element(s) are smaller than 11px`);
      if (shots && (r.overflow > 2 || r.lowContrast.length >= 8 || errors.length)) {
        await page.screenshot({ path: path.join(shots, `${p.id.replace(/\//g, '_')}-${size}-${mode}.png`), fullPage: false });
      }
    }
    await context.close();
  }
  await browser.close();
}

// ---------------------------------------------------------------- report
const merge = (list) => {
  // The same problem in four views is one problem; fold the view prefixes together.
  const groups = new Map();
  for (const item of list) {
    const m = item.match(/^((?:phone|desktop), (?:light|dark)): (.*)$/);
    const key = m ? m[2].replace(/\d+(\.\d+)?/g, '#') : item;
    const g = groups.get(key) ?? { text: m ? m[2] : item, views: [] };
    if (m) g.views.push(m[1]);
    groups.set(key, g);
  }
  return [...groups.values()].map((g) => (g.views.length ? `[${g.views.join(' | ')}] ${g.text}` : g.text));
};
let bad = 0;
for (const p of posts) {
  const f = findings[p.id];
  if (!f.defects.length && !f.notes.length) continue;
  if (f.defects.length) bad++;
  console.log(`\n${p.id}  (${p.title.slice(0, 40)})`);
  for (const d of merge(f.defects)) console.log(`  DEFECT  ${d}`);
  for (const n of merge(f.notes)) console.log(`  note    ${n}`);
}
const clean = posts.filter((p) => !findings[p.id].defects.length && !findings[p.id].notes.length).length;
console.log(`\n${posts.length} notes reviewed: ${bad} with defects, ${posts.length - bad - clean} with notes only, ${clean} clean`);
if (value('--json')) fs.writeFileSync(value('--json'), JSON.stringify(findings, null, 1));
process.exitCode = bad ? 1 : 0;
