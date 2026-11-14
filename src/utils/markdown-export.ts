/**
 * Plain-Markdown copy of a note, for agents and LLM tools.
 *
 * The source is already Markdown, so this is the body with a small header.
 * Two things are stripped because they are noise to a reader that cannot
 * render them: inline <style> blocks from HTML-embed posts, and base64
 * images, which can run to megabytes.
 */

import type { Post } from '../types';
import { siteConfig } from '../config';

export function postUrl(post: Post, site: URL | string): string {
  return new URL(`/posts/${post.id}/`, site).href;
}

export function postMarkdownUrl(post: Post, site: URL | string): string {
  return new URL(`/posts/${post.id}.md`, site).href;
}

export function postToMarkdown(post: Post, site: URL | string): string {
  const { title, description, planted, lastTended, tags } = post.data;
  const body = (post.body ?? '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<img\b[^>]*\bsrc="data:[^"]*"[^>]*>/gi, (tag) => {
      const alt = tag.match(/\balt="([^"]*)"/i)?.[1];
      return alt ? `[image: ${alt}]` : '[image]';
    })
    .replace(/!\[([^\]]*)\]\(data:[^)]*\)/g, (_, alt) => (alt ? `[image: ${alt}]` : '[image]'))
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const meta = [
    `Author: ${siteConfig.gardener}`,
    `Published: ${planted.toISOString().slice(0, 10)}`,
    lastTended && `Updated: ${lastTended.toISOString().slice(0, 10)}`,
    tags?.length && `Tags: ${tags.join(', ')}`,
    `Canonical: ${postUrl(post, site)}`,
  ].filter(Boolean);

  return [`# ${title}`, description && `> ${description}`, meta.join('  \n'), body]
    .filter(Boolean)
    .join('\n\n') + '\n';
}
