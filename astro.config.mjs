import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://blodroed.com',
  integrations: [tailwind()],
  output: 'server',

  adapter: node({
    mode: 'standalone'
  })
});