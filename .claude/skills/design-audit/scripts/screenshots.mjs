#!/usr/bin/env node
// Screenshot the key pages in light and dark, at desktop and phone width,
// for one colour theme. Run it before and after a visual change and compare.
//
//   npm run dev                                   # in another terminal
//   node .claude/skills/design-audit/scripts/screenshots.mjs <outdir> [theme] [pages]
//   node .claude/skills/design-audit/scripts/screenshots.mjs /tmp/before
//   node .claude/skills/design-audit/scripts/screenshots.mjs /tmp/nord nord home,article
//
// Needs Playwright with a Chromium build. It is not a dependency of this
// repo: set PLAYWRIGHT=/path/to/node_modules/playwright if `playwright`
// does not resolve from here. BASE_URL overrides http://127.0.0.1:4321.

import { createRequire } from 'node:module';
import fs from 'node:fs';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || 'playwright');
const [out, theme = '', only = ''] = process.argv.slice(2);
if (!out) {
  console.error('usage: screenshots.mjs <outdir> [theme] [comma,separated,pages]');
  process.exit(2);
}
const base = process.env.BASE_URL || 'http://127.0.0.1:4321';

// One page per template. `article` has headings, inline code and a code
// block; `quote` has a blockquote, links and a local graph.
const pages = {
  home: '/',
  garden: '/posts/',
  article: '/posts/clash-dns-system-deadlock/',
  quote: '/posts/self-expanding-agent-fleet/',
  about: '/about/',
};
const wanted = only ? only.split(',') : Object.keys(pages);

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const mode of ['light', 'dark']) {
  for (const [size, width, height] of [['desktop', 1280, 900], ['phone', 390, 800]]) {
    const context = await browser.newContext({ viewport: { width, height } });
    // The site reads both choices from localStorage before first paint.
    await context.addInitScript(([m, t]) => {
      try {
        localStorage.setItem('theme', m);
        if (t) localStorage.setItem('colorTheme', t);
      } catch {}
    }, [mode, theme]);
    const page = await context.newPage();
    page.on('pageerror', (e) => console.log('page error:', e.message));
    for (const name of wanted) {
      await page.goto(base + pages[name], { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${out}/${name}-${size}-${mode}.png` });
    }
    await context.close();
  }
}
await browser.close();
console.log(`saved ${wanted.length * 4} screenshots to ${out}`);
