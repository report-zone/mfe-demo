import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3004,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: './src/main.tsx',
      name: 'AdminMFE',
      formats: ['es'],
      fileName: 'admin-mfe',
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
    port: 3004,
  },
});
