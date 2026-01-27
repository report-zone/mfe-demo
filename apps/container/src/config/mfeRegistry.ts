/**
 * MFE Registry
 * 
 * Following the Open/Closed Principle (OCP),
 * this registry allows adding new MFEs without modifying MFELoader.
 * New MFEs can be registered by adding entries to this configuration.
 */

import { ComponentType, lazy } from 'react';
import { loadRemoteModule } from '../utils/remoteModuleLoader';

export interface MFEConfig {
  name: string;
  loadComponent: () => Promise<{ default: ComponentType }>;
  remoteUrl?: string; // URL for remote loading in production
  description?: string;
}

/**
 * Check if we're running in local/preview mode
 * This is a runtime check to distinguish between preview (localhost) and actual production
 */
const isLocalEnvironment = (): boolean => {
  // Check if running on localhost or local IP
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.')
  );
};

/**
 * Get the remote URL for an MFE from environment variables
 */
const getMFERemoteUrl = (mfeName: string): string | undefined => {
  const envVarName = `VITE_MFE_${mfeName.toUpperCase()}_URL`;
  return import.meta.env[envVarName];
};

/**
 * Get the port for an MFE in local development
 */
const getMFEPort = (mfeName: string): number => {
  const ports: Record<string, number> = {
    home: 3001,
    preferences: 3002,
    account: 3003,
    admin: 3004,
  };
  return ports[mfeName] || 3000;
};

/**
 * Create a loader function that handles both local (dev) and remote (prod) loading
 */
const createMFELoader = (
  mfeName: string,
): (() => Promise<{ default: ComponentType }>) => {
  return () => {
    const remoteUrl = getMFERemoteUrl(mfeName);
    const isLocal = isLocalEnvironment();
    
    // In development, localhost, or if no remote URL is configured, use local loading
    if (import.meta.env.DEV || !remoteUrl || isLocal) {
      // In preview mode (built but running locally), load from local preview servers
      if (!import.meta.env.DEV && isLocal) {
        const port = getMFEPort(mfeName);
        const localMfeUrl = `http://localhost:${port}/${mfeName}/${mfeName}-mfe.js`;
        return loadRemoteModule(localMfeUrl).then(module => {
          if (module.default) {
            return { default: module.default };
          }
          const keys = Object.keys(module);
          if (keys.length > 0) {
            return { default: module[keys[0]] };
          }
          throw new Error(`No exports found in local module: ${mfeName}`);
        });
      }
      
      // In dev mode, use module aliases
      switch (mfeName) {
        case 'home':
          return import('@mfe-demo/home');
        case 'preferences':
          return import('@mfe-demo/preferences');
        case 'account':
          return import('@mfe-demo/account');
        case 'admin':
          return import('@mfe-demo/admin');
        default:
          throw new Error(`Unknown MFE: ${mfeName}`);
      }
    }
    
    // In production with remote URL, load from remote
    const moduleUrl = `${remoteUrl}/${mfeName}-mfe.js`;
    return loadRemoteModule(moduleUrl).then(module => {
      // Try to get the default export, or the first export if no default
      if (module.default) {
        return { default: module.default };
      }
      const keys = Object.keys(module);
      if (keys.length > 0) {
        return { default: module[keys[0]] };
      }
      throw new Error(`No exports found in remote module: ${mfeName}`);
    });
  };
};

/**
 * MFE Registry - Add new MFEs here without modifying MFELoader
 */
export const mfeRegistry: Record<string, MFEConfig> = {
  home: {
    name: 'Home',
    loadComponent: createMFELoader('home'),
    description: 'Home page micro frontend',
  },
  preferences: {
    name: 'Preferences',
    loadComponent: createMFELoader('preferences'),
    description: 'User preferences micro frontend',
  },
  account: {
    name: 'Account',
    loadComponent: createMFELoader('account'),
    description: 'User account management micro frontend',
  },
  admin: {
    name: 'Admin',
    loadComponent: createMFELoader('admin'),
    description: 'Admin panel micro frontend',
  },
};

/**
 * Get MFE configuration by name
 */
export const getMFEConfig = (mfeName: string): MFEConfig | undefined => {
  return mfeRegistry[mfeName];
};

/**
 * Get lazy-loaded component for an MFE
 */
export const getMFEComponent = (mfeName: string): ComponentType => {
  const config = getMFEConfig(mfeName);
  if (!config) {
    // Return placeholder for unknown MFEs
    return lazy(() =>
      import('../components/MFEPlaceholder').then(module => ({
        default: () => module.default({ name: 'Not Found' }),
      }))
    );
  }
  return lazy(config.loadComponent);
};

/**
 * Register a new MFE (for extensibility)
 */
export const registerMFE = (key: string, config: MFEConfig): void => {
  mfeRegistry[key] = config;
};
