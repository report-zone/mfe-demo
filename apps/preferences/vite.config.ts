import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/preferences/',  // Base URL for production deployment
  server: {
    port: 3002,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: './src/main.tsx',
      name: 'PreferencesMFE',
      formats: ['es'],
      fileName: 'preferences-mfe',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
        },
      },
    },
  },
  preview: {
    port: 3002,
  },
});
