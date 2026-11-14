---
name: geo-check
description: Check and improve how answer engines and AI agents (ChatGPT, Claude, Perplexity, Google AI Overviews) can find, read and cite this site. Use when asked about GEO, AEO, AI search visibility, llms.txt, structured data, SEO of the garden, or before publishing a new note. Verifies the built site with a script and lists what only the author can improve.
---

# GEO check

GEO (generative engine optimisation) is making a site easy for an answer
engine to fetch, understand, attribute and quote. For a personal garden
that comes down to five questions. The site answers the first four in code;
the fifth is writing.

| Question an engine asks | How this site answers it |
| --- | --- |
| Am I allowed in, and where is everything? | `robots.txt`, sitemap, `/llms.txt` |
| Can I read it without the page chrome? | `/posts/<slug>.md` for every note |
| What is this page, who wrote it, when? | JSON-LD, `og:type article`, `<time datetime>`, `<meta name="author">` |
| What language is it? | `<html lang>` per note |
| Is there a passage worth quoting? | The note itself: a clear claim near the top |

## Run the check

```bash
npm run build
node .claude/skills/geo-check/scripts/geo-check.mjs
```

It reads `dist/` and fails if a note lacks language, author, dates, an
existing social image, a Markdown copy or valid structured data, or if
`llms.txt` does not list every note. Fix failures in the template, not per
note: every signal is generated.

For a scored audit against a wider rubric, use the AEOTester plugin if it
is installed (`/aeotester:audit`). Move its `aeotester-report.md` out of the
repo afterwards. Baseline after the first pass: 110/127.

## Where each signal comes from

| Signal | File |
| --- | --- |
| `/llms.txt` | `src/pages/llms.txt.ts` |
| Markdown copies | `src/pages/posts/[...slug].md.ts`, `src/utils/markdown-export.ts` |
| Content type and `noindex` for the copies | `public/_headers` (Cloudflare Pages) |
| Meta tags, WebSite and Person JSON-LD | `src/layouts/BaseLayout.astro` |
| BlogPosting and BreadcrumbList JSON-LD | `src/layouts/PostLayout.astro` |
| Language detection | `src/utils/lang.ts` |
| Default social image | `npm run generate-og -- --default-only --force` |
| 404 page | `src/pages/404.astro` |

## When writing or reviewing a note

These are the parts no template can do. Check them before publishing.

- **`description` in frontmatter.** It becomes the meta description, the
  JSON-LD description, the card text and the `llms.txt` line. One or two
  sentences that state what the note concludes, not what it is about.
- **Answer first.** Engines quote the passage that answers the question.
  Put the conclusion in the first paragraph (the Clash DNS note does this
  with "先说结论").
- **Headings that say something.** A heading like "为什么平时没事，一切网就坏"
  can be matched to a question; "背景" cannot.
- **Numbers with their source and date.** A figure an engine can attribute
  gets cited; an unsourced one gets skipped.
- **`lastTended` when you revise.** It is the modified date everywhere.
- **`lang`** only if detection is wrong (a Chinese title on an English
  note, or the reverse). Values are BCP 47: `zh-CN`, `en`.
- **Alt text** on images that carry information. Figures embedded as
  base64 with no `alt` are invisible to a text reader; the Markdown copy
  replaces them with `[image]`.
- **Link related notes** with wikilinks. Backlinks are how a reader, human
  or not, finds the rest of a topic.

## Known false alarms

- **"Thin content" on Chinese notes.** Audit tools count words by spaces,
  so a 3,000-character Chinese note scores as 100 words. Ignore it.
- **Title and description "too short".** The 50 to 60 and 120 to 160
  character targets assume Latin text. Chinese carries the same meaning in
  about half the characters.
- **"No Organization schema".** This is a personal site. The publisher is a
  `Person`; do not invent an organisation.

## Decisions that belong to the owner

Raise these; do not decide them.

- **`Content-Signal` in `robots.txt`**: whether AI companies may use the
  notes for search, as answer input, or for training. Today nothing is
  stated, which leaves all three unrestricted.
- **Blocking specific AI crawlers.** Currently every agent is allowed.
- **Credentials on the About page.** Role, years of experience and what the
  author has built are the strongest author signal, and only the author
  can write them.
- **The site description** in `src/config.ts`. It is the first line of
  `llms.txt` and the home page title; a specific one ("notes on coding
  agents and ...") is found for more questions than a general one.
