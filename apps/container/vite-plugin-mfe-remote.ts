/**
 * Vite Plugin: MFE Remote Resolver
 *
 * This plugin prevents MFE modules from being bundled into the container
 * when remote URLs are configured via environment variables.
 */

import type { Plugin } from 'vite';

export function mfeRemoteResolver(): Plugin {
  return {
    name: 'mfe-remote-resolver',
    enforce: 'pre',

    resolveId(source: string) {
      // Check if this is an MFE package import
      const mfePackages = [
        '@mfe-demo/home',
        '@mfe-demo/preferences',
        '@mfe-demo/account',
        '@mfe-demo/admin',
      ];

      if (mfePackages.includes(source)) {
        // Extract MFE name from package name
        const mfeName = source.replace('@mfe-demo/', '');
        const envVarName = `VITE_MFE_${mfeName.toUpperCase()}_URL`;

        // If remote URL is configured, return a virtual module ID
        if (process.env[envVarName]) {
          return `\0virtual:mfe-remote:${mfeName}`;
        }
      }

      return null;
    },

    load(id: string) {
      // Handle virtual MFE remote modules
      if (id.startsWith('\0virtual:mfe-remote:')) {
        const mfeName = id.replace('\0virtual:mfe-remote:', '');

        // Return a stub module that will be loaded remotely at runtime
        return `
          // Virtual stub for remote MFE: ${mfeName}
          // This module will be loaded dynamically at runtime
          export default null;
        `;
      }

      return null;
    },
  };
}
