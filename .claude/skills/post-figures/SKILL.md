---
name: post-figures
description: Draw diagrams and add illustrations to a note so they explain something and read well on a phone and a desktop, in light and dark. Use when a note needs a flow, architecture or comparison diagram, when adding AI-generated or other illustrations, or when a figure "looks too small / too big / cut off / wrong on mobile". Covers what to draw, a responsive HTML flow component, illustration sizing, and the checks to run before publishing.
---

# Post figures

A figure earns its place when a cold reader sees a mechanism they would
otherwise have to assemble from prose: where work flows, who talks to whom,
what changes between two options. If a sentence says it faster, write the
sentence.

## What to draw

- **The mechanism, not its name.** A box called "cache" adds nothing. The
  path through it, the two things it sits between, and the arrow that
  disappears without it are the information.
- **Comparisons show the difference.** Put the two options side by side and
  make the one edge or step that differs visible. Separate boxes with nothing
  connecting them are just a list.
- **Label every arrow** with what moves or happens: `派活`, `交出改动`,
  `polls every 30s`. An unlabeled arrow means "related somehow".
- **One highlight.** Mark the single step the paragraph is about (the
  verifier, the gate, the option you lean to) with the accent. Everything
  else stays neutral.
- **One figure, one claim.** Every figure gets a `<figcaption>` that states
  what it shows in one sentence, and the same sentence as `aria-label`.
- **Short labels.** A title plus at most one short line of detail per box.
  Explanations go in the caption or the prose.

## Flow diagrams: use the HTML component, not SVG

An SVG scales as a picture: on a phone its text shrinks to 7–9px, or it has
to scroll sideways. The HTML component below keeps text at body size, lays
out left to right on wide screens and stacks top to bottom under 640px.

Paste [flow.css](flow.css) into the note's styles (`publish.sh --css`). It
only uses blog tokens (`--foreground`, `--muted`, `--muted-foreground`,
`--accent`), so dark mode needs nothing extra.

```html
<figure class="fl" role="img" aria-label="One-sentence claim">
  <div class="fr">                                   <!-- a row: horizontal, stacks on phones -->
    <div class="fn"><b>首轮工人</b><small>做第一版 · 跑测试</small></div>
    <div class="fa"><span>交出改动</span><i></i></div>   <!-- labelled arrow -->
    <div class="fn hi"><b>Orchestrator</b><small>对照要求抽查</small></div>  <!-- hi = the one highlight -->
  </div>
  <div class="fo"><span class="lp">↺ 有缺口：再来一轮</span><span class="ok">✓ 全部满足：交给你</span></div>
  <figcaption>One-sentence claim.</figcaption>
</figure>
```

| Piece | Class | Use |
|---|---|---|
| Row of steps | `fr` | left to right; becomes a column under 640px |
| Column | `fc` | top to bottom at every width (hub layouts) |
| Box | `fn` | `<b>` title + optional `<small>` detail |
| Highlight / optional box | `fn hi` / `fn dash` | the step that matters / sleeps or is optional |
| Wide box | `fn wide` | a shared hub (a board, a queue) |
| Arrow | `fa` | `<span>` label + `<i></i>` line; `fa v` = vertical |
| Outcomes | `fo` | loop and exit pills under a row |
| Grid of members | `fg` | auto-fits peers in a hub layout |
| Repeating phase | `fp` + `pl` | dashed frame with a label ("每个里程碑重复一遍") |

Keep a row to at most three boxes; more than that crowds a 760px column. Split
a long flow into rows joined by a vertical arrow (`fa v`).

If you really need SVG (a shape the component cannot make), size it so the
smallest text renders at 12px or more at the narrowest width it will be shown.
If that cannot be done, it should be HTML.

## Text is text, never a picture of text

A screenshot of a paragraph, a list, a table or a card of bullet points is
unreadable on a phone, cannot be searched, copied or translated, and does not
follow dark mode. Write it as HTML and give it a quiet special style instead:

- a passage worth setting apart: a 2px `var(--accent)` left rule, or a
  `var(--muted)` panel with 10px radius
- a table: a real `<table>` in an `overflow-x:auto` wrapper, small pill badges
  for ratings
- two options side by side: two cards that stack on phones, one neutral and
  one with the accent border
- a chart: HTML bars (label, proportional bar, value) beat a raster chart

Images are for things that are not words: illustrations, real UI
screenshots, photos.

## Illustrations

- **Size**: inline illustrations `max-width: 600px`, centred; a wide hero
  strip at full column width. Phones get the full screen width. Do not go
  smaller than about 560px on desktop or they read as thumbnails; do not go
  full width for 16:9 pictures or they push the text off screen.
- **Generating them** (e.g. grok `image_gen`): ask for one shared style
  across the set, the same character design, no text or letters, and "the
  whole subject in frame with a clear margin on all four sides".
- **Check for cropping** before using them:

  ```bash
  node .claude/skills/post-figures/scripts/edge-check.mjs path/to/*.png
  ```

  It reports any edge where the picture runs into the frame. A touching edge
  needs a human look: background scenery may bleed off on purpose, but the
  subject (a roof, a head, a hand) must not. Fix by outpainting or
  regenerating, never by CSS cropping.
- **Formats**: embed as WebP data URIs in the source, then `npm run images`
  moves them to `public/images/posts/<slug>/` with AVIF + WebP fallback,
  real dimensions, lazy loading and an 800px phone size. Check that a rerun did
  not add duplicates (`fig-06…` beside `fig-01…`); point the note back at the
  first set and delete the copies.

## Before publishing

1. `npm run build`, `npx astro preview --host 127.0.0.1 --port 4329`, then
   post-review's `post-audit.mjs --only <slug>` must be clean.
2. Run `scripts/measure.mjs <slug>` against the preview: it reports SVG text
   under 12px, SVGs that scroll sideways, tall images and page overflow.
3. Look at every figure at **375, 768 and 1280px**, in **light and dark**.
   Read the figure's text at 375px: if you squint, it is too small.
4. The page must not scroll sideways. Wide tables go in an
   `overflow-x:auto` wrapper and keep their first column `white-space:nowrap`.

## Mistakes already made here

- SVG diagrams capped at 640px with 11–14px text: tiny on desktop, unreadable
  or sideways-scrolling on phones. Use the HTML component.
- `flex-basis` on a box inside a column container became its **height**
  (a 190px tall box). Boxes in `fc` are `flex:none`.
- A title made of `Subagents、/boost、/swarm、/teamwork` has no line-break
  opportunity and widened the whole page on phones. Put spaces or words
  between such runs, or shorten the title.
- Illustrations at full width were too big, at 440px too small; 600px is the
  default.
- Several notes carried screenshots of their own text (lists, tables,
  cards) as images; on a phone they were a grey blur. Now HTML text.
- An AI picture had its roof cut off by the frame. `edge-check.mjs` catches
  that before it ships.
