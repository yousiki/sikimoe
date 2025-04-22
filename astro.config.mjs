import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';
import { proseRemarkPlugin } from './prose-remark-plugin.mjs';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkgraphviz from 'remark-graphviz';
import remarkMermaid from 'astro-diagram/remark-mermaid';
import rehypeStringify from 'rehype-stringify';
import rehypeGraphviz from 'rehype-graphviz';
import redotStringify from 'redot-stringify';
import robotsTxt from 'astro-robots-txt';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.siki.moe/',

  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),

  integrations: [
    mdx(),
    sitemap(),
    vue(),
    robotsTxt({
      sitemap: ['https://www.siki.moe/sitemap-index.xml'],
    }),
  ],

  markdown: {
    redotPlugins: [redotStringify],
    remarkPlugins: [
      proseRemarkPlugin,
      remarkMath,
      remarkParse,
      remarkRehype,
      remarkgraphviz,
      remarkMermaid,
    ],
    rehypePlugins: [
      rehypeKatex,
      //rehypeMermaid,
      rehypeStringify,
      rehypeGraphviz,
    ],
    // syntaxHighlight: false,
  },

  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },
});
