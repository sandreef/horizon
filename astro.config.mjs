// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkWikiLinks } from './src/plugins/remark-wiki-links.mjs';
import { remarkCallouts } from './src/plugins/remark-callouts.mjs';

// The site is served from https://sandreef.github.io/horizon/
const base = '/horizon';

export default defineConfig({
  site: 'https://sandreef.github.io',
  base,
  trailingSlash: 'always',
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, [remarkWikiLinks, { base }], remarkCallouts],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
