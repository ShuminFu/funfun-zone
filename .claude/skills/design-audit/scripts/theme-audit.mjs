#!/usr/bin/env node
// Measure every colour theme: does each ramp keep one hue, does lightness
// fall evenly, and do the pairs the components actually use have enough
// contrast? Exit code 1 if anything fails.
//
//   node .claude/skills/design-audit/scripts/theme-audit.mjs [path/to/themes/index.ts] [--ramps]
//
// --ramps also prints every step as hex with its lightness and hue.

import fs from 'node:fs';
import { toOklch, contrast, hex, readThemes } from './oklch.mjs';

const file = process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 'src/themes/index.ts';
const showRamps = process.argv.includes('--ramps');
const themes = readThemes(fs.readFileSync(file, 'utf8'));
const WHITE = [255, 255, 255];

// A ramp is allowed a hue gradient only when it is declared here on purpose.
const INTENTIONAL_HUE_SHIFT = { 'nord.accent': 'Nord frost runs cyan to blue by design' };

let problems = 0;
for (const [name, t] of Object.entries(themes)) {
  const p = t.primary;
  const light = t.accent;
  const dark = t.accentDark ?? t.accent;
  console.log(`\n== ${name}`);

  for (const [label, ramp] of [['primary', p], ['accent', light], ...(t.accentDark ? [['accentDark', dark]] : [])]) {
    const steps = Object.entries(ramp).map(([k, v]) => ({ k, v, ...toOklch(v) }));
    // Near-white steps carry too little colour for their hue to mean anything.
    const hues = steps.filter((s) => s.C > 0.012 && +s.k >= 200).map((s) => s.h);
    const spread = hues.length ? Math.max(...hues) - Math.min(...hues) : 0;
    const monotonic = steps.every((s, i) => i === 0 || s.L < steps[i - 1].L + 0.004);
    const excused = INTENTIONAL_HUE_SHIFT[`${name}.${label}`];
    const hueVerdict = spread <= 25 ? 'one hue' : excused ? `hue shifts ${spread.toFixed(0)}° (${excused})` : `MIXED HUES, spread ${spread.toFixed(0)}°`;
    console.log(`  ${label.padEnd(10)} ${hueVerdict}; lightness ${monotonic ? 'falls steadily' : 'IS NOT MONOTONIC'}`);
    if ((spread > 25 && !excused) || !monotonic) problems++;
    if (showRamps) {
      for (const s of steps) {
        console.log(`    ${s.k.padStart(3)}  ${hex(s.v)}  L ${s.L.toFixed(3)}  C ${s.C.toFixed(3)}  h ${s.C < 0.004 ? '  -' : s.h.toFixed(0).padStart(3)}`);
      }
    }
  }

  // [what it is, foreground, background, minimum ratio]
  // Text needs 4.5. Surfaces only need to be told apart, so their floor is low.
  const checks = [
    ['light: body text 800 on page 50', p[800], p[50], 4.5],
    ['light: meta text 600 on page 50', p[600], p[50], 4.5],
    ['light: meta text 600 on white card', p[600], WHITE, 4.5],
    ['light: tag text 600 on chip 100', p[600], p[100], 4.5],
    ['light: link accent-600 on page 50', light[600], p[50], 4.5],
    ['light: link hover accent-700 on white', light[700], WHITE, 4.5],
    ['light: white card against page 50', WHITE, p[50], 1.02],
    ['dark: body text 200 on page 950', p[200], p[950], 4.5],
    ['dark: meta text 400 on page 950', p[400], p[950], 4.5],
    ['dark: meta text 400 on card 900', p[400], p[900], 4.5],
    ['dark: tag text 300 on chip 800', p[300], p[800], 4.5],
    ['dark: link accent-400 on page 950', dark[400], p[950], 4.5],
    ['dark: link accent-400 on card 900', dark[400], p[900], 4.5],
    ['dark: card 900 against page 950', p[900], p[950], 1.08],
    ['dark: border 800 against card 900', p[800], p[900], 1.08],
  ];
  let passed = 0;
  for (const [label, fg, bg, min] of checks) {
    const ratio = contrast(fg, bg);
    if (ratio >= min) passed++;
    else {
      problems++;
      console.log(`  FAIL ${label.padEnd(40)} ${ratio.toFixed(2)} (needs ${min})`);
    }
  }
  console.log(`  contrast   ${passed}/${checks.length} pairs pass`);
}

console.log(problems ? `\n${problems} problem(s)` : '\nAll themes pass');
process.exitCode = problems ? 1 : 0;
