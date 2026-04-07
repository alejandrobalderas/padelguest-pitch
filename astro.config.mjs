// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project page: https://alejandrobalderas.github.io/padelguest-pitch/
  // `site` is the canonical origin; `base` is the path prefix every URL must include.
  site: 'https://alejandrobalderas.github.io',
  base: '/padelguest-pitch/',
  vite: {
    // Cast plugin to any: Astro 6 ships its own Vite, which has slightly different
    // type signatures than the standalone @tailwindcss/vite plugin's Vite version.
    // The runtime is compatible — this is a TypeScript namespace mismatch only.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
