import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies /api to the Express backend on 4180.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5180,
    proxy: {
      '/api': 'http://127.0.0.1:4180',
      '/previews': 'http://127.0.0.1:4180',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
