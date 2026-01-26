import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use base URL only in production build, not in dev mode
  base: command === 'build' ? '/container/' : '/',
  resolve: {
    alias: {
      '@mfe-demo/preferences': path.resolve(__dirname, '../preferences/src/main.tsx'),
    },
  },
  server: {
    port: 4000,
    host: true,
    watch: {
      // Watch MFE source files for changes
      ignored: ['!**/node_modules/@mfe-demo/**'],
    },
    fs: {
      // Allow serving files from the MFE directories
      allow: ['..'],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  preview: {
    port: 4000,
  },
}));
