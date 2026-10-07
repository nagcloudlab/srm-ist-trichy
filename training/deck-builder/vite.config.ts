import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// One self-contained HTML file per deck so each opens straight from the file system.
// The build mode selects the deck (ids in src/decks.ts); scripts/publish.mjs builds every
// deck into .out/<id>/index.html and copies it to its place under training/.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: `.out/${mode}`,
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
  },
}));
