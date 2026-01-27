import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { mfeRemoteResolver } from './vite-plugin-mfe-remote';

export default defineConfig(({ command, mode }) => {
  // Check if remote MFE URLs are configured
  const hasRemoteUrls = !!(
    process.env.VITE_MFE_HOME_URL &&
    process.env.VITE_MFE_PREFERENCES_URL &&
    process.env.VITE_MFE_ACCOUNT_URL &&
    process.env.VITE_MFE_ADMIN_URL
  );
  
  // Use aliases when in dev mode OR when remote URLs are not configured
  const useAliases = command !== 'build' || !hasRemoteUrls;
  
  // Use base path for production builds and preview, but not for dev server
  const isDevServer = command === 'serve' && mode === 'development';
  
  return {
    plugins: [
      mfeRemoteResolver(), // Add MFE remote resolver plugin
      react(),
    ],
    // Use base URL for production build and preview, not in dev mode
    base: isDevServer ? '/' : '/container/',
    define: {
      // Define process.env as an empty object to prevent "process is not defined" errors
      // This is needed when loading remote MFEs that may reference process
      'process.env': JSON.stringify({}),
      // Also define process itself to prevent "process is not defined" errors
      'process': JSON.stringify({ env: {} }),
    },
    resolve: {
      alias: useAliases ? {
        // Use local aliases for development or when remote URLs not configured
        '@mfe-demo/preferences': path.resolve(__dirname, '../preferences/src/main.tsx'),
        '@mfe-demo/home': path.resolve(__dirname, '../home/src/main.tsx'),
        '@mfe-demo/account': path.resolve(__dirname, '../account/src/main.tsx'),
        '@mfe-demo/admin': path.resolve(__dirname, '../admin/src/main.tsx'),
      } : {
        // In production with remote URLs, don't set aliases (handled by plugin)
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
    rollupOptions: {
      // Externalize React and related libraries when using remote MFEs
      // This ensures the container and MFEs use the same React instance from the import map
      external: hasRemoteUrls ? ['react', 'react-dom', 'react-dom/client', 'react-router-dom'] : [],
    },
  },
    preview: {
      port: 4000,
      host: true,
      cors: true, // Enable CORS for cross-origin MFE loading in preview mode
    },
  };
});
