import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import remarkMermaid from 'astro-diagram/remark-mermaid';
import robotsTxt from 'astro-robots-txt';
import { defineConfig } from 'astro/config';
import redotStringify from 'redot-stringify';
import rehypeGraphviz from 'rehype-graphviz';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import remarkgraphviz from 'remark-graphviz';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { proseRemarkPlugin } from './prose-remark-plugin.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://siki.moe/',

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
      sitemap: ['https://siki.moe/sitemap-index.xml'],
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
