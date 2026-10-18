import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export const SITE_URL = 'https://nsw-pedia.com';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: { format: 'directory' },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        if (item.url === SITE_URL + '/') item.priority = 1.0;
        else if (item.url.includes('/games/')) item.priority = 0.8;
        else if (item.url.includes('/emulators/')) item.priority = 0.8;
        else if (item.url.includes('/guides/')) item.priority = 0.7;
        else item.priority = 0.5;
        item.changefreq = 'weekly';
        return item;
      },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  image: { responsiveStyles: false, layout: 'constrained' },
});
