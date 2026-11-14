#!/usr/bin/env node
// Move chosen steps of a theme ramp to a target lightness, keeping each
// step's own hue and chroma. Use it to fix a contrast failure without
// changing what colour the theme is. Edits src/themes/index.ts in place.
//
//   node .claude/skills/design-audit/scripts/restep.mjs <theme> <ramp> <step>=<L> [<step>=<L> ...]
//   node .claude/skills/design-audit/scripts/restep.mjs sage accent 600=0.512 700=0.435
//
// L is OKLCH lightness, 0 (black) to 1 (white). Add --dry to print without writing.
// The reference ladder used by Classic, steps 50..950:
//   0.988 0.964 0.918 0.862 0.710 0.585 0.475 0.390 0.325 0.272 0.222   (neutrals)
//   0.976 0.948 0.895 0.815 0.715 0.610 0.512 0.435 0.365 0.305 0.225   (accents)

import fs from 'node:fs';
import { toOklch, toRgb } from './oklch.mjs';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const dry = process.argv.includes('--dry');
const [theme, ramp, ...targets] = args;
if (!theme || !ramp || !targets.length) {
  console.error('usage: restep.mjs <theme> <primary|accent|accentDark> <step>=<L> ...');
  process.exit(2);
}

const file = 'src/themes/index.ts';
let src = fs.readFileSync(file, 'utf8');
const start = src.indexOf(`\n  ${theme}: {`);
if (start < 0) throw new Error(`theme "${theme}" not found in ${file}`);
const end = src.indexOf('\n  },\n', start) + 6;
let block = src.slice(start, end);
const rs = block.indexOf(`${ramp}: {`);
if (rs < 0) throw new Error(`ramp "${ramp}" not found in theme "${theme}"`);
const re = block.indexOf('}', rs);
let seg = block.slice(rs, re);

for (const target of targets) {
  const [step, value] = target.split('=');
  const L = Number(value);
  let found = false;
  seg = seg.replace(new RegExp(`'${step}': '([\\d ]+)'`), (_, v) => {
    found = true;
    const { C, h } = toOklch(v.split(' ').map(Number));
    const out = toRgb(L, C, h).join(' ');
    console.log(`${theme}.${ramp}.${step}: ${v} -> ${out}`);
    return `'${step}': '${out}'`;
  });
  if (!found) throw new Error(`step ${step} not found`);
}

if (!dry) {
  block = block.slice(0, rs) + seg + block.slice(re);
  fs.writeFileSync(file, src.slice(0, start) + block + src.slice(end));
  console.log(`wrote ${file}. Run theme-audit.mjs, and mirror Classic changes into src/styles/global.css.`);
}
