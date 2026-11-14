---
name: design-audit
description: Find out why a page or theme of this site looks off, and fix it without guessing. Use when asked to improve the look, refine colours or colour harmony, add or edit a colour theme, restyle a component, or review a visual change. Measures the palette (hue, lightness, contrast) with scripts, then checks the result in screenshots of every mode.
---

# Design audit

"It doesn't look good" is almost never one big mistake. It is several small
ones that can each be measured. Measure first, then change, then look.

## The order of work

1. **Capture before.** `npm run dev`, then
   `node .claude/skills/design-audit/scripts/screenshots.mjs <dir>`.
   It takes home, garden, two articles and About, in light and dark, at
   desktop and phone width. Look at them before reading any CSS.
2. **Measure the palette.**
   `node .claude/skills/design-audit/scripts/theme-audit.mjs --ramps`.
   Colour problems show up as numbers: a hue that jumps, two surfaces with
   the same lightness, text below 4.5:1.
3. **Write the findings down** as plain statements with the number that
   proves each one ("dark card and dark page are both lightness 0.27, so
   contrast is 1.02:1"). If a finding has no number or screenshot behind
   it, it is an opinion; go and get the evidence or drop it.
4. **Show the owner before changing code.** Findings first, then the plan,
   then the choices that are theirs: anything that changes the character of
   the site (brand colour, layout of the hero, card style). Recommend one.
5. **Change in this order:** palette, status colours, surfaces, layout,
   article typography. Colour comes first because every later step is
   judged against it. One commit per step.
6. **Capture after and compare**, in every theme you touched. The audit
   script proves contrast, not that the page looks right.

## What to check, and what "good" is here

**One hue per ramp.** `primary-50..950` is one grey getting darker. A ramp
that changes hue partway reads as two unrelated colours wherever two steps
meet. Neutrals lean slightly toward the accent's hue; a hue-less grey next
to a coloured accent looks unconsidered. An intentional gradient (Nord's
frost) is declared in `theme-audit.mjs`, not left to pass by accident.

**Even lightness steps.** Components pick steps by number, so the numbers
have to mean the same thing in every theme: 950 is the dark page, 900 the
dark card, 800 dark borders, 600 light meta text, 400 dark meta text. If
900 is not lighter than 950, dark mode has no depth.

**Dark mode is designed, not inverted.** Surfaces get lighter as they come
forward (page, card, border). A light-mode shadow becomes a brighter edge.

**An accent is one colour per mode.** If light and dark use different
accent colours, give each mode a full ramp (`accentDark` in the theme) so
one screen never mixes them. Never splice two hues into one ramp.

**Status colours are a family and never follow the theme.** Growth stages,
callouts and confidence badges share one lightness and one chroma per mode;
only the hue moves. They live as `--growth-*` and `--status-*` tokens in
`src/styles/global.css`. Never use a raw Tailwind colour (`green-500`,
`gray-600`) or a hex in a component: it will ignore the theme and the mode.

**Text is readable.** Body and meta text at 4.5:1 or better on the surface
it actually sits on (a chip, a card, the page), icons at 3:1. Check the
real pair; meta text that passes on the page can fail on a tinted chip.

**Surfaces, not outlines.** If a card needs a border, two inner rules and
outlined tags to hold together, the page will read as a wireframe. Give the
page a faint tint and the card a real surface, drop rules that spacing can
replace, and fill small chips. Use border, fill, radius and shadow to set
apart the one thing that needs it.

**One edge, one focal point.** The hero shares a left edge with the content
below it. The heaviest element on a screen should be the most important.

**Things that look like links are links.** Headings wrapped in anchors,
inline code and plain emphasis must not wear the link colour.

**Chinese long-form.** No italics (CJK has none; the browser fakes a slant),
line height near 1.85, serif headings fall back to Noto Serif SC.

**Every interactive element has a hover and a visible focus state**, and
motion is off under `prefers-reduced-motion`.

## How to fix a colour

Do not pick a new hex by eye. Decide the lightness the step needs and keep
its hue and chroma:

```bash
node .claude/skills/design-audit/scripts/restep.mjs sage accent 600=0.512 700=0.435
node .claude/skills/design-audit/scripts/theme-audit.mjs
```

`restep.mjs` prints the reference lightness ladder. To build a new ramp,
choose a hue and a chroma curve (low at both ends, highest around 500 to
600) and put it on that ladder with `toRgb` from `scripts/oklch.mjs`.

## Where things live

| What | File |
| --- | --- |
| Theme ramps (source of truth) | `src/themes/index.ts` |
| Classic fallback values, status tokens, prose, `card` utilities | `src/styles/global.css` |
| Theme applied before first paint, per mode | inline script in `src/layouts/BaseLayout.astro` |
| Typography plugin colours | `tailwind.config.mjs` |
| Code block palettes | `shikiConfig` in `astro.config.mjs` |

Change Classic's ramp in `src/themes/index.ts` and mirror it in the
`:root` / `.dark` fallback block of `global.css`.

## Before you call it done

- `theme-audit.mjs` exits 0.
- Screenshots of every touched theme, light and dark, desktop and phone:
  no clipped text, no element that only works in one mode.
- `npm run build` succeeds.
- No raw Tailwind palette colour or hex was added to a component:
  `grep -rnE "(bg|text|border)-(gray|slate|green|amber|red|blue|purple)-[0-9]" src --include=*.astro`
