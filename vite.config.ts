import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// IMPORTANT (GitHub Pages): set `base` to "/<your-repo-name>/" when you deploy
// to a project page like https://<user>.github.io/<repo>/.
// Leave it as "/" for local dev or a user/root page.
// Override at build time with:  BASE_PATH=/fe-awakening-matchmaker/ npm run build
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Generate a service worker that precaches the built app shell.
      // Portraits/sprites are runtime-cached (cache-first) once visited.
      includeAssets: ['favicon.svg', 'assets/icons/*.png'],
      manifest: {
        name: 'FE Awakening Matchmaker',
        short_name: 'FE Matchmaker',
        description:
          'Pair Fire Emblem Awakening characters and explore marriages, supports, children, and builds.',
        theme_color: '#141a2e',
        background_color: '#141a2e',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          {
            src: 'assets/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'assets/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'assets/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the shell + JSON data so the app works fully offline.
        globPatterns: ['**/*.{js,css,html,svg,woff2}', 'data/*.json'],
        runtimeCaching: [
          {
            // Portraits and sprites: cache-first, capped so storage stays sane.
            urlPattern: ({ url }) =>
              url.pathname.includes('/assets/portraits/') ||
              url.pathname.includes('/assets/sprites/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'fe-art',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: {
        // Keep the SW off during dev to avoid stale-cache confusion.
        enabled: false,
      },
    }),
  ],
});
