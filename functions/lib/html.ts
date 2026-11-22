/**
 * Private pages reuse the public shell (header, theme, CSS) and replace
 * only the main column. Note text is already escaped by the markdown renderer.
 */

import { siteConfig } from '../../src/config.ts';
import { escapeHtml } from './markdown.ts';
import type { PrivateNote, PrivateNoteMeta } from './catalog.ts';

const HOME_BUTTON =
  'inline-flex items-center rounded-xl border border-primary-300 px-5 py-2.5 font-sans font-medium text-primary-800 transition-colors hover:border-primary-500 hover:bg-white dark:border-primary-700 dark:text-primary-200 dark:hover:border-primary-500 dark:hover:bg-primary-900';

export function renderInsideShell(
  shell: string,
  options: { title: string; canonical: string; main: string },
): string {
  let html = shell;
  const title = `${options.title} | ${siteConfig.name}`;
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  if (!/name="robots"/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1>\n    <meta name="robots" content="noindex, nofollow" />`);
  }
  html = html.replace(
    /(<link\b[^>]*rel="canonical"[^>]*href=")[^"]*("[^>]*>)/i,
    `$1${escapeHtml(options.canonical)}$2`,
  );
  html = html.replace(
    /(<meta\b[^>]*property="og:url"[^>]*content=")[^"]*("[^>]*>)/i,
    `$1${escapeHtml(options.canonical)}$2`,
  );
  const replaced = replaceMain(html, options.main);
  if (replaced) return replaced;
  const styles = [...shell.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/gi)].map((match) => match[0]).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>${escapeHtml(title)}</title>
  ${styles}
</head>
<body class="min-h-screen">
  <main id="page-main" class="grow">${options.main}</main>
</body>
</html>`;
}

export function replaceMain(html: string, inner: string): string | null {
  const match = /<main\b[^>]*\bid=["']page-main["'][^>]*>/i.exec(html);
  if (!match) return null;
  const start = match.index + match[0].length;
  const end = closingMain(html, start);
  if (end < 0) return null;
  return html.slice(0, start) + inner + html.slice(end);
}

function closingMain(html: string, from: number): number {
  const re = /<\/?main\b[^>]*>/gi;
  re.lastIndex = from;
  let depth = 1;
  let match = re.exec(html);
  while (match) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return match.index;
    match = re.exec(html);
  }
  return -1;
}

export function libraryMain(notes: readonly PrivateNoteMeta[]): string {
  const ordered = notes.toSorted((a, b) => b.planted.localeCompare(a.planted) || a.slug.localeCompare(b.slug));
  const count = `${ordered.length} private ${ordered.length === 1 ? 'note' : 'notes'}`;
  const items = ordered
    .map((note) => {
      const when = formatPlanted(note.planted);
      return `<article class="min-w-0 border-b border-primary-200 py-8 last:border-b-0 dark:border-primary-800">
        <div class="mb-3 text-sm text-primary-600 dark:text-primary-400">${when ? `<time class="tabular-nums" datetime="${escapeHtml(note.planted)}">${when}</time>` : ''}</div>
        <h2 class="text-2xl leading-snug text-primary-900 dark:text-primary-100"><a href="/private/${escapeHtml(note.slug)}/">${escapeHtml(note.title)}</a></h2>
      </article>`;
    })
    .join('\n');
  const body = notes.length
    ? `<div class="mt-4">${items}</div>`
    : `<div class="py-12 text-center"><p class="text-primary-600 dark:text-primary-400">No private notes yet.</p></div>`;
  return `<div class="mx-auto max-w-3xl px-4 py-12 sm:py-16">
    <h1 class="mb-2 text-4xl text-primary-900 dark:text-primary-100">Private Notes</h1>
    <p class="text-primary-600 dark:text-primary-400">${count}</p>
    ${body}
  </div>`;
}

export function noteMain(note: PrivateNote, bodyHtml: string): string {
  const when = formatPlanted(note.planted);
  return `<div class="mx-auto max-w-3xl px-4 py-12 sm:py-16">
    <p class="mb-6"><a href="/private/" class="font-sans text-sm text-primary-600 transition-colors hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-100">Private Notes</a></p>
    <h1 class="mb-3 text-4xl text-primary-900 dark:text-primary-100">${escapeHtml(note.title)}</h1>
    ${when ? `<p class="mb-8 text-sm text-primary-600 dark:text-primary-400"><time class="tabular-nums" datetime="${escapeHtml(note.planted)}">${when}</time></p>` : ''}
    <div class="prose-mycelium">${bodyHtml}</div>
  </div>`;
}

export function messageMain(
  kicker: string,
  title: string,
  message: string,
  links: readonly { href: string; label: string }[] = [{ href: '/', label: 'Home' }],
): string {
  const actions = links
    .map(
      (link) =>
        `<a href="${escapeHtml(link.href)}" class="${HOME_BUTTON}">${escapeHtml(link.label)}</a>`,
    )
    .join('');
  return `<div class="relative mx-auto max-w-5xl px-4 py-20 sm:py-28">
    <p class="mb-3 font-mono text-sm text-primary-600 dark:text-primary-400">${escapeHtml(kicker)}</p>
    <h1 class="mb-4 text-4xl tracking-tight text-primary-900 dark:text-primary-100 sm:text-5xl">${escapeHtml(title)}</h1>
    <p class="mb-8 max-w-xl text-lg text-primary-600 dark:text-primary-400">${escapeHtml(message)}</p>
    <div class="flex flex-wrap gap-3">${actions}</div>
  </div>`;
}

function formatPlanted(planted: string): string {
  const date = new Date(`${planted}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf())) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: siteConfig.timezone,
  });
}
