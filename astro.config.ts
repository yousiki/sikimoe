import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { SITE_URL } from './src/data/site';

// Static output only: the whole site is prerendered at build time and served
// from Cloudflare Pages' CDN, so there is no adapter and no server runtime.
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    sitemap({
      // `/og` exists only as a screenshot source for the social card.
      filter: (page) => !page.includes('/og'),
    }),
  ],
  env: {
    schema: {
      PUBLIC_SITE_ENV: envField.enum({
        context: 'client',
        access: 'public',
        values: ['production', 'preview', 'development'],
        default: 'development',
        optional: true,
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
