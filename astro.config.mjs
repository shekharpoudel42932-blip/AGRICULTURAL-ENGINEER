// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // TODO: replace with the real production URL (used for sitemap, RSS and canonical URLs)
  site: 'https://shekharpoudel49.com.np',
  integrations: [mdx(), sitemap()],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Never inline downloadable attachments as data: URIs (browsers block opening those in a new tab)
      assetsInlineLimit: (file) =>
        /\.(pdf|docx?|xlsx?|pptx?|od[tsp]|csv|txt|zip|km[lz]|dwg)$/i.test(file) ? false : undefined,
    },
  },
});
