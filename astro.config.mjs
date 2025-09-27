import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";

import node from '@astrojs/node';

import icon from 'astro-icon';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.blodroed.com',
  integrations: [tailwind(), icon(), sitemap()],
  output: 'server',

  adapter: node({
    mode: 'standalone'
  }),
  server: {
    port: 80,
    host: true,
  },
});