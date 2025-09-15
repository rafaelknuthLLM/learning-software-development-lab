import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, '../src/index.html'),
      },
    },
    sourcemap: true,
    minify: 'terser',
    target: 'es2018',
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    host: true,
  },
  preview: {
    port: 8080,
    host: true,
  },
  optimizeDeps: {
    include: ['axios'],
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  css: {
    devSourcemap: true,
  },
  esbuild: {
    target: 'es2018',
  },
});