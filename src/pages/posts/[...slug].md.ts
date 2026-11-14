/**
 * /posts/<slug>.md: the Markdown copy of each note.
 *
 * Advertised from the HTML page with <link rel="alternate" type="text/markdown">
 * and listed in /llms.txt. public/_headers sets the content type and keeps
 * these copies out of search indexes (the HTML page is the canonical one).
 */

import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import type { Post } from '../../types';
import { postToMarkdown } from '../../utils/markdown-export';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('posts', ({ data }) => !data.draft && !data.noIndex);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
};

export const GET: APIRoute = ({ props, site }) => {
  return new Response(postToMarkdown(props.post as Post, site!), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
