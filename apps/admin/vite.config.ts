import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
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
    // Define import.meta.env.DEV based on build mode
    // This ensures import.meta.env.DEV is properly defined in production builds
    'import.meta.env.DEV': mode === 'development',
    // Define process.env to prevent "process is not defined" errors when loaded remotely
    'process.env': JSON.stringify({}),
    // Also define process itself to prevent "process is not defined" errors
    'process': JSON.stringify({ env: {} }),
  },
  preview: {
    port: 3004,
  },
}));
