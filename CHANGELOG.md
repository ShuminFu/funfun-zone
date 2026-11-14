# Changelog

## Unreleased

### Added

- `/llms.txt` and a Markdown copy of every note at `/posts/<slug>.md`, for
  answer engines and agents. Site-wide WebSite and Person JSON-LD, article
  meta tags, real `<time datetime>` dates, a default social image, and a
  404 page.
- Notes are served in their own language: `<html lang>` is detected from
  the title, or set with a new optional `lang` frontmatter field. Chinese
  notes were previously served as `lang="en"`.
- Project skills in `.claude/skills/`: `design-audit` (palette measurement
  and screenshot scripts) and `geo-check` (build verifier).

### Changed

- Classic is rebuilt as single-hue scales. The neutral scale mixed three
  hues, so dark cards had the same lightness as the dark page. The accent
  has a full scale per mode (`accentDark`): blue for light, mint for dark.
- Growth stages, callouts and confidence badges share one family of status
  colours instead of stock Tailwind hues. Link icons take the link colour.
- Cards have no inner rules, tags are filled chips, and cards have a hover
  state. The home hero is left-aligned with live garden counts.
- Articles: headings are ink (they inherited the link colour), inline code
  is a neutral chip, code blocks follow the page theme, blockquotes are
  upright, and body leading is 1.85 for Chinese long-form.
- The Connections panel in the article sidebar is collapsed by default: one
  row with the number of linked notes. Opening it lists the linked notes and
  draws the graph. The choice is remembered across notes, and d3 is only
  loaded when the panel is first opened.
- Sage, Anthropic and Nord light-mode links were below 4.5:1 contrast;
  their accent 600-950 steps are darker. Hues are unchanged.

- Anthropic is a fifth theme and keeps the warm cream paper palette. Sage,
  classic, nord, and minimal each have their own primary, accent, and background
  again. The default theme is classic. A saved ocean, sunset, rose, or forest
  theme falls back to classic.
- Garden growth filters use the active theme's accent for the selected tab
  and count, instead of fixed green, amber, and emerald fills.

### Fixed

- **Ctrl+K search never opened.** `CommandPalette.astro` used a `define:vars`
  script, which Astro inlines without compiling or bundling. Its TypeScript
  cast was a syntax error in the browser ("Unexpected identifier 'as'"), and
  `import('fuse.js')` could not resolve a bare module name there either. The
  index now ships in a `<script type="application/json">` tag and the palette
  script is bundled, so it compiles and imports Fuse normally.

## 2.0.0 (2026-07-20)

Major dependency modernization plus a new draft preview system.

### Breaking

- **Requires Node 22.12+** (previously Node 18+) — Astro 7's minimum.
- **Astro 5 → 7.** The default compiler is now Rust-based and stricter: HTML
  comments (`<!-- -->`) are no longer allowed inside `{JSX expressions}`. The
  `markdown.remarkPlugins` / `rehypePlugins` config surface is deprecated in
  favor of the new Sätteri processor. The theme's remark/rehype pipeline
  (wikilinks, callouts, mermaid, galleries, sidenotes, dropcaps) still runs via
  the compatibility path with identical output — a warning today, but it will
  need migrating before Astro 8.
- **Tailwind CSS 3 → 4.** The deprecated `@astrojs/tailwind` integration is
  replaced by the `@tailwindcss/vite` plugin. `global.css` now uses
  `@import "tailwindcss"` and loads the existing `tailwind.config.mjs` via
  `@config`, so the 7-theme runtime color system, class-based dark mode, and the
  typography plugin all carry over unchanged.

### Added

- **Draft preview system.** A top-level `drafts/` folder, kept outside the
  Obsidian vault, is rendered at full `PostLayout` fidelity at `/drafts-preview`
  during `npm run dev` and emits **nothing** in a production build (no HTML,
  sitemap entry, or OG image). Relocate it via `DRAFTS_DIR` in
  `src/content.config.ts`. See `drafts/README.md`.
- `.nvmrc` and a `package.json` `engines` field pinning Node 22.

### Changed

- Bumped `@astrojs/mdx` 4 → 7, plus `@astrojs/rss`, `@astrojs/sitemap`,
  `@fontsource/*`, `fuse.js`, and `@tailwindcss/typography` to current releases.
- `sharp` 0.34 → 0.35 — 0.34 has no prebuilt binary for Node 24, so the 1.0.0
  release could no longer be installed on current Node.
- Removed the unused `lucide-react` dependency.
- CI and the README GitHub Pages deploy workflow now run on Node 22.

### Fixed

- Callout color variants (`callout-note`/`-tip`/`-warning`/`-danger`/`-info`)
  were tree-shaken out of the Tailwind 4 build because they are applied
  dynamically by the remark plugin; moved the callout rules into
  `@layer components` so they always ship.

## 1.0.0 (2026-02-08)

First open-source release.

### What's included

- Astro 5 static site with Tailwind CSS
- Obsidian vault integration (open `src/content/` as vault)
- 9 custom Obsidian plugins (climate, focus, garden, spore, trace, signal, label, prune, network)
- 8 pre-configured community plugins (obsidian-git, homepage, paste-image-rename, unsplash, BRAT, settings-search, tag-wrangler, folder-notes)
- 7 color themes (sage, ocean, sunset, minimal, nord, rose, forest)
- Wikilink support with anchors and backlinks
- D3.js graph visualization
- Command palette (Ctrl+K)
- Growth indicators (seedling/budding/evergreen) calculated from backlinks
- Callout blocks matching Obsidian syntax
- Dark/light mode
- OG image generation
- RSS feed and sitemap
- `npm run setup` interactive configuration
- `npm run update-theme` for upstream merges
- Deploy guides for Netlify, Vercel, GitHub Pages

### History

This project grew out of months of iteration on a personal digital garden. Earlier commits cover the full arc from initial Astro scaffold through Obsidian integration, plugin development, and theme refinement. See `git log` for the full story.
