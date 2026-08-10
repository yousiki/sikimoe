import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { SITE_URL } from './src/data/site';

// Static output only: the whole site is prerendered at build time and served by
// an assets-only Cloudflare Worker, so there is no adapter and no server runtime.
//
// No `prefetch`: every internal link on the site is a hash anchor, so Astro's
// prefetch runtime would ship an extra module on every page and never fire.
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      // `/og` exists only as a screenshot source for the social card.
      filter: (page) => !page.includes('/og'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
