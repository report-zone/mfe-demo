import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@mfe-demo/preferences': path.resolve(__dirname, '../preferences/src/App.tsx'),
    },
  },
  server: {
    port: 4000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  preview: {
    port: 4000,
  },
});
