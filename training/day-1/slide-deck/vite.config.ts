import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// One self-contained HTML file per deck so each opens straight from the file system.
//   vite build               → dist/index.html            (Day 1 deck)
//   vite build --mode deep   → dist-deep/index-deep.html  (deep dive; renamed to index.html by npm run build:deep)
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: mode === 'deep' ? 'dist-deep' : 'dist',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: mode === 'deep' ? { input: 'index-deep.html' } : undefined,
  },
}));
