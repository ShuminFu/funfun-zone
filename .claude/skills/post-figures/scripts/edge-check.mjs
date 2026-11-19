#!/usr/bin/env node
/**
 * Flag illustrations whose subject touches the frame (likely cropped).
 *
 *   node .claude/skills/post-figures/scripts/edge-check.mjs a.png b.webp ...
 *
 * The background colour is taken from the four corners. For each edge, a
 * 6px strip is scanned; if more than 3% of its pixels differ from the
 * background by more than 40 (sum of RGB deltas), that edge is reported.
 * Exit code 1 when any file has a touching edge.
 */
import sharp from 'sharp';

const STRIP = 6, TOL = 40, LIMIT = 0.03;
let bad = 0;
for (const file of process.argv.slice(2)) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const px = (x, y) => { const i = (y * w + x) * 3; return [data[i], data[i + 1], data[i + 2]]; };
  const corners = [px(0, 0), px(w - 1, 0), px(0, h - 1), px(w - 1, h - 1)];
  const bg = [0, 1, 2].map(c => Math.round(corners.reduce((a, p) => a + p[c], 0) / 4));
  const off = p => Math.abs(p[0] - bg[0]) + Math.abs(p[1] - bg[1]) + Math.abs(p[2] - bg[2]) > TOL;
  const share = (xs, ys) => { let n = 0, t = 0; for (const y of ys) for (const x of xs) { t++; if (off(px(x, y))) n++; } return n / t; };
  const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);
  const edges = {
    top: share(range(0, w), range(0, STRIP)),
    bottom: share(range(0, w), range(h - STRIP, h)),
    left: share(range(0, STRIP), range(0, h)),
    right: share(range(w - STRIP, w), range(0, h)),
  };
  const touching = Object.entries(edges).filter(([, v]) => v > LIMIT);
  if (touching.length) bad++;
  console.log(`${touching.length ? 'TOUCHES' : 'ok     '}  ${file}  ${touching.map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`).join(', ')}`);
}
process.exit(bad ? 1 : 0);
