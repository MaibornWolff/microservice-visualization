import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base:'./',
  root: path.join(__dirname, "src"),
  build: {
    outDir: path.join(__dirname, "build", "html"),
    emptyOutDir: true,
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
