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
      '@mfe-demo/home': path.resolve(__dirname, '../home/src/main.tsx'),
      '@mfe-demo/account': path.resolve(__dirname, '../account/src/main.tsx'),
      '@mfe-demo/admin': path.resolve(__dirname, '../admin/src/main.tsx'),
    },
  },
  server: {
    port: 4000,
    host: true,
    watch: {
      // Enable watching of MFE source files in sibling directories
      // The negated pattern allows Vite to watch node_modules/@mfe-demo packages
      // which are aliased to the actual MFE source directories
      ignored: ['!**/node_modules/@mfe-demo/**'],
    },
    fs: {
      // Allow serving files from the MFE directories (parent of container)
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
