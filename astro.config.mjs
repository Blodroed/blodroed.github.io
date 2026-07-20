import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

import icon from 'astro-icon';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.blodroed.com',
  integrations: [icon(), sitemap()],
  output: 'server',

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: node({
    mode: 'standalone'
  }),
});