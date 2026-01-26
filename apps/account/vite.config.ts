import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/account/',  // Base URL for production deployment
  server: {
    port: 3003,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: './src/main.tsx',
      name: 'AccountMFE',
      formats: ['es'],
      fileName: 'account-mfe',
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
    // Define import.meta.env.DEV based on build mode
    // This prevents "process is not defined" errors in production
    'import.meta.env.DEV': mode === 'development',
  },
  preview: {
    port: 3003,
  },
}));
