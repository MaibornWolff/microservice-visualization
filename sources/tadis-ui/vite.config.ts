import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base:'./',
  root: path.join(__dirname, "src"),
  build: {
    outDir: path.join(__dirname, "build", "html"),
    emptyOutDir: true,
    // Vite 8 defaults CSS minification to lightningcss, which rejects the
    // legacy IE "star hack" (e.g. *zoom) present in the bundled CSS. Keep the
    // previous esbuild minifier, which tolerates it.
    cssMinify: 'esbuild',
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html']
    }
  }
});
