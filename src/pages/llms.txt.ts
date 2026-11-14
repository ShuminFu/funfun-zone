/**
 * /llms.txt: a plain-text map of the site for LLM tools (https://llmstxt.org).
 *
 * One line per note, newest first, linking to the Markdown copy so a model
 * can read the text without parsing the page chrome.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '../config';
import { postMarkdownUrl } from '../utils/markdown-export';

export const GET: APIRoute = async ({ site }) => {
  const posts = (await getCollection('posts', ({ data }) => !data.draft && !data.noIndex)).sort(
    (a, b) => b.data.planted.valueOf() - a.data.planted.valueOf()
  );
  const pages = await getCollection('pages', ({ data }) => !data.draft);
  const url = (path: string) => new URL(path, site).href;
  const line = (title: string, href: string, note?: string) =>
    `- [${title}](${href})${note ? `: ${note.replace(/\s+/g, ' ').trim()}` : ''}`;

  const text = [
    `# ${siteConfig.name}`,
    `> ${siteConfig.description} Written by ${siteConfig.gardener}. Most notes are in Chinese; a few are in English.`,
    'Each note below links to a Markdown copy. The HTML page is the same URL without `.md`, with a trailing slash.',
    '## Notes',
    posts
      .map((post) =>
        line(
          post.data.title,
          postMarkdownUrl(post, site!),
          [post.data.planted.toISOString().slice(0, 10), post.data.description].filter(Boolean).join('. ')
        )
      )
      .join('\n'),
    '## Pages',
    pages.map((page) => line(page.data.title, url(`/${page.id}/`), page.data.description)).join('\n'),
    '## Optional',
    [
      line('All notes', url('/posts/'), 'the garden index, filterable by growth stage and tag'),
      line('RSS feed', url('/feed.xml')),
      line('Sitemap', url('/sitemap-index.xml')),
    ].join('\n'),
  ].join('\n\n');

  return new Response(text + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
