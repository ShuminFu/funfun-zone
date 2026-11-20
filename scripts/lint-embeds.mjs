#!/usr/bin/env node
// Lint embedded-HTML posts so a post can never restyle the rest of the site.
//
// Runs before every build (prebuild), so a bad post fails `npm run build`
// locally, in CI and on Cloudflare Pages.
//
// Errors (build fails):
//   E1 unscoped CSS     a <style> selector in a post that is not under the post's
//                       wrapper: .html-embed, or a class that sits next to
//                       `not-prose` on a wrapper element (.fd-fig, .wf-report, ...).
//                       #id selectors count as scoped.
//                       Example that broke the header: `.sticky{background:...}`
//                       left unscoped, which painted the site's sticky header yellow.
//   E2 page-only tag    <!doctype>, <html>, <head>, <body>, <title> or <meta> in a
//                       post body. They mean a whole page was pasted in unconverted,
//                       usually with its raw <style> next to them.
//   E3 utility class    embed markup uses a Tailwind utility name as its own class
//                       (sticky, fixed, hidden, flex, ...). The site's utility then
//                       applies to the embed, and the embed's rule fights the site.
//   E4 component class  embed markup uses a site component class (card, callout, ...);
//                       the site's own rule for it then leaks into the embed.
//
// Posts listed in scripts/lint-embeds.baseline.json predate this lint. Their
// errors print as warnings so the build passes; fix them and delete the entry.
// A new post, or a new error kind in a listed post, still fails.
//
// Usage: node scripts/lint-embeds.mjs [files...]   (default: every post)

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const POSTS = join(ROOT, 'src/content/posts');
const SCOPE = '.html-embed';

// At-rules whose body holds ordinary rules that must be scoped too.
const NESTED = /^@(media|supports|container|layer|scope|document)\b/i;
// At-rules whose body is not selectors (frames, descriptors).
const OPAQUE = /^@(-webkit-)?(keyframes|font-face|property|page|counter-style|font-feature-values)\b/i;

const UTILITY = new Set([
  'sticky', 'fixed', 'absolute', 'relative', 'static', 'hidden', 'block', 'inline',
  'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'contents', 'table',
  'container', 'invisible', 'visible', 'truncate', 'underline', 'uppercase', 'italic',
  'group', 'peer', 'prose', 'sr-only', 'shadow', 'border', 'rounded', 'transition',
]);
const COMPONENT = new Set(['card', 'callout', 'highlight', 'line']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.mdx?$/.test(name)) out.push(p);
  }
  return out;
}

// Blank out fenced and inline code so tutorials that *show* HTML are not linted.
function stripCode(md) {
  return md
    .replace(/^(```|~~~)[\s\S]*?^\1/gm, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/`[^`\n]*`/g, (m) => ' '.repeat(m.length));
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

function splitSelectors(prelude) {
  const out = [];
  let depth = 0, cur = '';
  for (const ch of prelude) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

// Returns the unscoped selectors in a CSS string.
function unscoped(css, scopes) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const bad = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    const semi = css.indexOf(';', i);
    if (open === -1) break;
    if (semi !== -1 && semi < open) { i = semi + 1; continue; } // @import, @charset
    const prelude = css.slice(i, open).trim();
    let depth = 1, j = open + 1;
    while (j < css.length && depth) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    const inner = css.slice(open + 1, j - 1);
    if (NESTED.test(prelude)) bad.push(...unscoped(inner, scopes));
    else if (!OPAQUE.test(prelude) && !prelude.startsWith('@')) {
      for (const sel of splitSelectors(prelude)) {
        const classes = [...sel.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((x) => x[1]);
        if (!classes.some((c) => scopes.has(c)) && !sel.includes('#')) bad.push(sel);
      }
    }
    i = j;
  }
  return bad;
}

const files = process.argv.slice(2).length ? process.argv.slice(2) : walk(POSTS);
let baseline = {};
try { baseline = JSON.parse(readFileSync(join(ROOT, 'scripts/lint-embeds.baseline.json'), 'utf8')); } catch {}
let errors = 0, warnings = 0;

for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const body = stripCode(raw.replace(/^---\n[\s\S]*?\n---\n/, (m) => m.replace(/[^\n]/g, ' ')));
  const rel = relative(ROOT, file);
  const grandfathered = baseline[rel] || [];
  let quiet = 0;
  const report = (kind, idx, msg) => {
    if (grandfathered.includes(kind)) { quiet++; warnings++; return; }
    console.log(`${rel}:${lineOf(body, idx)}  ${kind}  ${msg}`);
    if (kind.startsWith('E')) errors++; else warnings++;
  };
  // The post's own wrapper classes: .html-embed plus any class sharing an element with not-prose.
  const scopes = new Set(['html-embed']);
  for (const m of body.matchAll(/\bclass="([^"]*\bnot-prose\b[^"]*)"/g)) {
    for (const c of m[1].split(/\s+/)) if (c && c !== 'not-prose') scopes.add(c);
  }

  for (const m of body.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const sel of unscoped(m[1], scopes)) {
      report('E1', m.index, `unscoped CSS selector "${sel.slice(0, 60)}" — it styles the whole site; prefix it with ${SCOPE} (or the post's wrapper class)`);
    }
    const defined = new Set([...m[1].replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((x) => x[1]));
    for (const c of defined) {
      if (UTILITY.has(c)) report('E3', m.index, `CSS defines ".${c}", a Tailwind utility the site also uses — rename it (e.g. ".pg-${c}")`);
    }
  }

  for (const m of body.matchAll(/<(!doctype|html|head|body|title|meta)\b/gi)) {
    report('E2', m.index, `<${m[1]}> in a post body — a whole page was pasted in; convert it with blog-html-post (embed_html.py)`);
  }

  if (body.includes(SCOPE)) {
    for (const m of body.matchAll(/\bclass="([^"]*)"/g)) {
      for (const c of m[1].split(/\s+/)) {
        if (UTILITY.has(c)) report('E3', m.index, `class "${c}" is a Tailwind utility; the site's rule will apply to the embed — rename it (e.g. "pg-${c}")`);
        else if (COMPONENT.has(c)) report('E4', m.index, `class "${c}" is also a site component class; the site's rule leaks into the embed — rename it (e.g. "pg-${c}")`);
      }
    }
  }
  if (quiet) console.log(`${rel}  baseline  ${quiet} known issue(s) [${grandfathered.join(',')}] — fix, then remove from lint-embeds.baseline.json`);
}

if (errors || warnings) console.log(`\nlint-embeds: ${errors} error(s), ${warnings} warning(s) in ${files.length} post(s)`);
if (errors) process.exit(1);
