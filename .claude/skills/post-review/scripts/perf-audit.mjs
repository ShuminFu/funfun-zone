#!/usr/bin/env node
// How fast does the blog load for a first-time visitor on a phone?
//
// Opens each page in a fresh browser (cold cache) on an emulated mid-range
// phone over a slow 4G connection, and reports when text first appears
// (FCP), when the largest element is drawn (LCP), layout shift (CLS), and
// what was downloaded, by type.
//
//   node .claude/skills/post-review/scripts/perf-audit.mjs                       # the live site
//   BASE_URL=http://127.0.0.1:4329 node .claude/skills/post-review/scripts/perf-audit.mjs
//   node .claude/skills/post-review/scripts/perf-audit.mjs --json out.json /posts/some-note/
//
// Needs Playwright with Chromium (set PLAYWRIGHT=/path/to/node_modules/playwright).
// Timings depend on where this runs; sizes and request counts do not. Compare
// runs made from the same place, and trust the byte counts most.

import { createRequire } from 'node:module';
import fs from 'node:fs';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT || 'playwright');
const args = process.argv.slice(2);
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const base = process.env.BASE_URL || 'https://funfun.zone';
const pages = args.filter((a, i) => a.startsWith('/') && args[i - 1] !== '--json');
if (!pages.length) {
  pages.push('/', '/posts/', '/posts/agentpilot-improvement-loop/', '/posts/codex-agent-01-loop/', '/posts/clash-dns-system-deadlock/');
}

// Lighthouse's "slow 4G" profile: 1.6 Mbps down, 750 kbps up, 150 ms round trip, 4x slower CPU.
const NET = { offline: false, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 150 };
const proxy = base.startsWith('https') ? process.env.HTTPS_PROXY || process.env.https_proxy : null;
const browser = await chromium.launch(proxy ? { proxy: { server: proxy } } : {});
const kb = (n) => `${Math.round(n / 1024)} KB`;
const results = [];

for (const path of pages) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', NET);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  const requests = new Map();
  cdp.on('Network.requestWillBeSent', (e) => requests.set(e.requestId, { url: e.request.url, type: e.type, bytes: 0, failed: false }));
  cdp.on('Network.responseReceived', (e) => { const r = requests.get(e.requestId); if (r) { r.type = e.type; r.status = e.response.status; r.encoding = e.response.headers['content-encoding'] || e.response.headers['Content-Encoding'] || ''; } });
  cdp.on('Network.loadingFinished', (e) => { const r = requests.get(e.requestId); if (r) r.bytes = e.encodedDataLength; });
  cdp.on('Network.loadingFailed', (e) => { const r = requests.get(e.requestId); if (r) r.failed = true; });

  await page.addInitScript(() => {
    window.__lcp = 0; window.__cls = 0; window.__lcpEl = '';
    new PerformanceObserver((list) => { for (const e of list.getEntries()) { window.__lcp = e.startTime; window.__lcpEl = (e.element?.tagName || '').toLowerCase() + (e.url ? ' ' + e.url.split('/').pop().slice(0, 40) : ''); } }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  });

  const started = Date.now();
  let failed = null;
  try {
    await page.goto(base + path, { waitUntil: 'load', timeout: 120000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
  } catch (e) {
    failed = e.message.split('\n')[0];
  }
  const settled = Date.now() - started;
  const t = failed ? null : await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0;
    return { ttfb: nav.responseStart, fcp, lcp: window.__lcp, lcpEl: window.__lcpEl, cls: window.__cls, dcl: nav.domContentLoadedEventEnd, load: nav.loadEventEnd, htmlDecoded: nav.decodedBodySize, htmlTransfer: nav.transferSize, dom: document.querySelectorAll('*').length };
  });

  const all = [...requests.values()].filter((r) => !r.url.startsWith('data:'));
  const group = (r) => (r.type === 'Document' ? 'html' : r.type === 'Stylesheet' ? 'css' : r.type === 'Script' ? 'js' : r.type === 'Font' ? 'font' : r.type === 'Image' ? 'image' : 'other');
  const byType = {};
  for (const r of all) { const g = (byType[group(r)] ??= { n: 0, bytes: 0 }); g.n++; g.bytes += r.bytes; }
  const total = all.reduce((s, r) => s + r.bytes, 0);
  const host = new URL(base).host;
  const thirdParty = [...new Set(all.filter((r) => { try { return new URL(r.url).host !== host; } catch { return false; } }).map((r) => new URL(r.url).host + (r.failed ? ' (failed here)' : '')))];
  const biggest = [...all].sort((a, b) => b.bytes - a.bytes).slice(0, 4).map((r) => `${r.url.split('/').pop().slice(0, 48) || '(page)'} ${kb(r.bytes)}`);
  const row = { path, failed, ...t, settled, total, requests: all.length, byType, thirdParty, biggest };
  results.push(row);

  console.log(`\n${path}`);
  if (failed) { console.log(`  did not load: ${failed}`); await context.close(); continue; }
  const s = (ms) => `${(ms / 1000).toFixed(1)} s`;
  console.log(`  first text ${s(t.fcp)}   largest element ${s(t.lcp)} (${t.lcpEl.trim() || '?'})   layout shift ${t.cls.toFixed(3)}   fully loaded ${s(settled)}`);
  console.log(`  downloaded ${kb(total)} in ${all.length} requests: ` + Object.entries(byType).map(([k, v]) => `${k} ${kb(v.bytes)} (${v.n})`).join(', '));
  console.log(`  page HTML ${kb(t.htmlTransfer)} on the wire, ${kb(t.htmlDecoded)} unpacked, ${t.dom} elements`);
  console.log(`  biggest: ${biggest.join(' · ')}`);
  if (thirdParty.length) console.log(`  other hosts: ${thirdParty.join(', ')}`);
  await context.close();
}
await browser.close();
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(results, null, 1));
