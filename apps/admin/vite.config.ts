import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/admin/',  // Base URL for production deployment
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
  define: {
    // Define import.meta.env.DEV as false for production builds
    // This prevents "process is not defined" errors in production
    'import.meta.env.DEV': 'false',
  },
  preview: {
    port: 3004,
  },
});
