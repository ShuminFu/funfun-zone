---
name: post-review
description: Review notes the way a reader meets them, on a phone and on a desktop, in light and dark. Use before publishing a note, after changing a layout or theme, when asked to audit or review posts for reader experience, readability or professionalism, or when a note "looks wrong". Runs a script over every built note and separates defects, which block, from notes for the author.
---

# Post review

A note is finished when a stranger on a phone at night can read it without
tripping. Most of what trips them is mechanical and can be measured, so
measure it. Judgement about the writing itself stays with the author.

## Run it

```bash
npm run build
npx astro preview --port 4329 &
node .claude/skills/post-review/scripts/post-audit.mjs
```

One note: `--only <slug>`. Source checks without a browser: `--source`.
Screenshots of every view that has a problem: `--shots <dir>`.

The script exits 1 if any note has a **defect**. A **note** is something
the author should know but that does not block publishing.

## What it checks, and why a reader cares

| Check | Defect when | Why |
| --- | --- | --- |
| Sideways scroll | the page, or a table, figure or code block not in its own scroller, is wider than the screen | On a phone the whole page wobbles, or content is cut off and unreachable |
| Readable text | 8 or more text elements below 4.5:1 (3:1 for large text), or any below 2:1 | Usually an embedded note whose colours only work in one mode |
| Broken images, script errors | any | The reader sees a gap or a dead widget |
| Description | missing, or printed under the title and again as the first line | The card, search result and social preview are empty, or the page opens by saying the same thing twice |
| Headings | a second H1, or a heading with nothing under it | The outline and the table of contents lie |
| Internal links | a `/posts/...` link to a note that does not exist | Dead end |
| Reading time | off by half or more | A "1 min read" that takes six is a small broken promise |

Reported as notes only: images without alt text, heading levels that skip,
pages over 600 KB (base64 images), a few faint labels, text under 11px.

## Rules the layouts already enforce

Do not work around these in a note; if one is wrong, fix it in the layout.

- **Reading time** counts Chinese by character and English by word, on the
  prose only (`src/utils/reading.ts`).
- **A note that opens by restating its description** gets no second copy
  under the title. Exact and near repeats are both detected.
- **Dark mode is announced two ways** on `<html>`: the `dark` class, which
  the site's own styles use, and `data-theme="dark"`, which embedded notes
  that began as standalone pages use.
- **Wide tables, figures and code** scroll inside their own box.

## Writing an embedded (HTML) note

Most notes here are HTML embeds with their own `<style>`. These are the
ways they have broken, so check them when writing one.

- **Give it both palettes.** Define colours as variables and redefine them
  under `html[data-theme="dark"] .html-embed` (or `.dark .html-embed`). A
  note with only light colours is unreadable at night: dark ink on the
  site's dark page.
- **Do not hard-code text colours on a transparent background.** Either
  set your own background too, or take colour from the site: `--foreground`,
  `--background`, `--accent`, `--muted-foreground` for text that recedes,
  and the `--status-*` and `--growth-*` tokens for meaning.
- **`--muted` is a surface, not a text colour.** Captions set in it are
  invisible.
- **Scope every rule under `.html-embed`** and avoid class names the site
  uses (`.card`, `.callout`, `.highlight`, `.line`).
- **Small labels and chips need 4.5:1 too.** Tinted chips are where
  contrast is lost: amber on cream, grey on grey.
- **No `# ` first-level heading and no repeat of the description** at the
  top. The layout prints the title; start with the content.
- **Images:** give each one `alt` text that says what it shows. Prefer a
  file in `public/` over base64 once a note has more than a couple; a page
  of 800 KB of HTML holds back the first paragraph on a slow connection.
- **Anything wide** (table, diagram, code) goes in a wrapper with
  `overflow-x: auto`, so it scrolls alone.

## Looking, after measuring

The script cannot judge layout. After it passes, look at the note at phone
width, top, middle and end, in both modes:

- Does the first screen say what the note is about?
- Do table columns have room, or is one column three characters wide?
- Do figures have captions, and are they legible at this size?
- Does anything float over the text?

`node .claude/skills/design-audit/scripts/screenshots.mjs <dir>` takes the
standard set; for one note, open it in the preview server.

## What is the author's call

Report these; do not change them unasked.

- The wording, structure and length of the note.
- Moving base64 images into files (it changes how notes are authored).
- Mock interfaces inside a note that use faint greys on purpose.
- Whether a near-repeat of the description at the top should be rewritten.
