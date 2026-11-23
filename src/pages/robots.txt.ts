import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site);
  // Disallow is a hint to crawlers. Private notes are withheld by the edge gate.
  return new Response(`User-agent: *\nAllow: /\nDisallow: /private/\nDisallow: /auth/\n\nSitemap: ${sitemapURL.href}\n`);
};
