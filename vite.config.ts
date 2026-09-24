import react from '@vitejs/plugin-react';
import { cheminfoBuildInfo, cheminfoPrerender } from 'react-cheminfo/vite';
import { defineConfig } from 'vite';

import { ROUTES, SITE_ID, SITE_URL } from './src/routes.ts';

/**
 * The port this project owns, derived from its creation date by
 * rules/backend.md: 2026-09-18 gives 6·09·18 = 60918, which is over 60000, so
 * 50000 comes off. Docker publishes it; the Vite dev server takes the next
 * number, claimed strictly, so two cheminfo checkouts never answer for each
 * other.
 */
const port = Number(process.env.PORT ?? 10_918);

export default defineConfig({
  // The build carries no mount path. Every asset is written relative, so the
  // one `dist` serves this site's own host and a path of a shared one without
  // being rebuilt: the `<base>` the page carries is what resolves them.
  base: './',
  plugins: [
    react(),
    cheminfoBuildInfo(),
    // One real HTML file per routed address, each with its own title,
    // description and canonical, plus the sitemap and robots.txt. A static
    // image has nothing to rewrite a head per request.
    cheminfoPrerender({
      site: SITE_ID,
      routes: ROUTES,
      origin: SITE_URL,
      description:
        'Count the electrons and neutrons of a formula, work out isotopic abundances, draw Lewis structures and assign oxidation states, with graded questions.',
      operatingSystem: 'Any modern browser',
      noscript: {
        hrefs: 'relative',
        heading: 'atoms.cheminfo.org — electrons, isotopes, Lewis structures',
        intro:
          'Count electrons and neutrons, work out isotopic abundances, draw Lewis structures and assign oxidation states, each with a calculator and a graded series of questions. The tools need JavaScript, because the chemistry runs in your browser.',
        routes: ROUTES,
        ecosystem: { taglines: false },
      },
    }),
  ],
  resolve: {
    // One copy of each, even when a dependency is linked from a checkout: two
    // copies of React make hooks read a dispatcher the renderer never filled,
    // and a molecule built by one copy of OpenChemLib is foreign to another.
    dedupe: ['react', 'react-dom', '@blueprintjs/core', 'openchemlib'],
  },
  server: { port: port + 1, strictPort: true },
  preview: { port: port + 1, strictPort: true },
  build: {
    // OpenChemLib is large and does not tree-shake; it is behind a
    // `React.lazy` boundary, so only the Lewis page pays for it.
    chunkSizeWarningLimit: 4096,
  },
});
