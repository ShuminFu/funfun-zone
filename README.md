# FunFun Zone

Shumin Fu's digital garden. [funfun.zone](https://funfun.zone).

The site is the [Mycelium](https://github.com/0bserver07/mycelium-theme) theme (MIT, Astro 7) with the existing notes moved into `src/content/`. Open `src/content/` as an Obsidian vault, not the repo root.

## Run locally

Requires Node **22.12+**.

```bash
npm install
npm run dev    # http://localhost:4321
npm run build  # static site in dist/
```

`npm run setup` is Mycelium's interactive wizard (site name, URL, git remote). This repo is already set to FunFun Zone / https://funfun.zone. Skip setup unless you mean to reconfigure it. It can replace the `origin` remote.

## Content

| Path | What |
| --- | --- |
| `src/content/posts/` | Notes. The URL is `/posts/<file-path>/`. |
| `src/content/pages/about.md` | About page |
| `src/config.ts` | Name, URL, author, `timezone` |

Dates display in **Asia/Bangkok**, the zone AstroPaper already used. Timestamps in the files are the original instants (mostly `+08:00`).

Garden features that are on: wikilinks, backlinks, growth (seedling / budding / evergreen, including the Codex series), local and global graph, RSS at `/feed.xml`, sitemap, OG meta tags.

Optional post frontmatter `icon` is a memory-point: a public path such as `/icons/notch.webp` (WebP on a transparent background). On the multi-column garden that card spans two columns, with the drawing sitting on the card at the right, about 40%. The same file is the badge above the title. Leave it unset for a one-column text note. `image` is still the cover / social image, separate from `icon`.

`/rss.xml` redirects to `/feed.xml`.

## HTML embeds

Posts that used to be `src/data/blog/<slug>.embed.md` are now `src/content/posts/<slug>.md`. The HTML body is unchanged. Markdown still allows raw HTML, so the `blog-html-post` skill can keep emitting a `<style>` block plus `<div class="html-embed">`.

What changed for that skill:

- Write Mycelium frontmatter (`title`, `description`, `planted`, `tags`, `draft`). `pubDatetime` is now `planted`. `modDatetime` is `lastTended`.
- Drop the `.embed.md` suffix. The filename (or `slug` in frontmatter, which Astro's loader prefers) is the URL.
- Do not wrap the file as MDX. Raw HTML in `.md` is the path that already builds.
- `author` is site-wide (`src/config.ts`). Per-post `featured: true` is kept on Claude Island and ignored by the index.

`npm run generate-og` can paint OG cards, but it loads a Latin Inter font and will not draw Chinese titles. It is not part of `npm run build`. AstroPaper's per-build dynamic OG images are gone.

## Deploy

Cloudflare Pages, static output. See [docs/cloudflare-pages.md](docs/cloudflare-pages.md). Node 22, build `npm run build`, publish `dist`.

## Theme

Titles use Source Serif 4 with Noto Serif SC for Chinese. Navigation, buttons, and meta stay in Inter. The page ground is warm paper (near-black in dark mode); sage, classic, nord, and minimal differ by accent, which is reserved for links and small marks.

Upstream: https://github.com/0bserver07/mycelium-theme

`npm run update-theme` merges that repo. It will conflict if theme files here have local edits (date timezone, HTML-link backlinks, embed CSS aliases, footer link).
