#!/usr/bin/env node
/**
 * Measure how each note's figures actually render at 375, 768 and 1280px.
 *
 *   npx astro preview --host 127.0.0.1 --port 4329 &
 *   PLAYWRIGHT=<path to playwright> node .claude/skills/post-figures/scripts/measure.mjs <slug> [<slug>...]
 *
 * Prints, per note and width: sideways page scroll, every inline SVG's
 * smallest rendered text size (viewBox scale x font-size) and whether it sits
 * in a sideways-scrolling box, and every image's rendered size. The rules in
 * SKILL.md: SVG text >= 12px at every width, no SVG that needs scrolling,
 * illustrations not taller than ~620px on desktop.
 */
const { chromium } = await import(process.env.PLAYWRIGHT + '/index.mjs').catch(() => import(process.env.PLAYWRIGHT));
const slugs = process.argv.slice(2);
const BASE = process.env.BASE || 'http://127.0.0.1:4329';
const b = await chromium.launch();
const out = {};
for (const w of [375, 768, 1280]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  for (const s of slugs) {
    await p.goto(`${BASE}/posts/${s}/`, { waitUntil: 'networkidle' });
    const r = await p.evaluate(() => {
      const art = document.querySelector('article') || document.body;
      const pageOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      const col = art.getBoundingClientRect().width;
      const svgs = [...art.querySelectorAll('svg')].filter(v => v.getBoundingClientRect().width > 120).map((v, i) => {
        const vb = v.viewBox.baseVal; const rw = v.getBoundingClientRect().width;
        const sizes = [...v.querySelectorAll('text')].map(t => parseFloat(getComputedStyle(t).fontSize)).filter(Boolean);
        const scale = vb && vb.width ? rw / vb.width : 1;
        let el = v.parentElement, scroll = false; while (el && el !== art) { const cs = getComputedStyle(el); if (/(auto|scroll)/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 2) scroll = true; el = el.parentElement; }
        return { i, rw: Math.round(rw), minText: sizes.length ? +(Math.min(...sizes) * scale).toFixed(1) : null, scroll, label: (v.getAttribute('aria-label') || '').slice(0, 30) };
      });
      const imgs = [...art.querySelectorAll('img')].map((m, i) => ({ i, rw: Math.round(m.getBoundingClientRect().width), rh: Math.round(m.getBoundingClientRect().height), nw: m.naturalWidth, src: (m.currentSrc || m.src).split('/').pop().slice(0, 20) }));
      return { pageOverflow, col: Math.round(col), svgs, imgs };
    });
    (out[s] ||= {})[w] = r;
  }
  await p.close();
}
await b.close();
for (const [s, ws] of Object.entries(out)) {
  const lines = [];
  for (const [w, r] of Object.entries(ws)) {
    if (r.pageOverflow > 0) lines.push(`  ${w}px  page scrolls sideways by ${r.pageOverflow}px`);
    for (const v of r.svgs) if ((v.minText ?? 99) < 12 || v.scroll) lines.push(`  ${w}px  svg#${v.i} text ${v.minText}px${v.scroll ? ', scrolls sideways' : ''}  ${v.label}`);
    if (w === '1280') for (const m of r.imgs) if (m.rh > 620) lines.push(`  ${w}px  img#${m.i} ${m.rw}x${m.rh} (tall)  ${m.src}`);
  }
  console.log(`${lines.length ? 'CHECK' : 'ok   '}  ${s}`); lines.forEach(l => console.log(l));
}
