import type { APIRoute } from 'astro';

import { SITE_URL } from '../data/site';

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL(SITE_URL)).href.replace(/\/$/, '');

  return new Response(
    ['User-agent: *', 'Allow: /', '', `Sitemap: ${origin}/sitemap-index.xml`, ''].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
