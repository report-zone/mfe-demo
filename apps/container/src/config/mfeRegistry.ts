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
 * Get the remote URL for an MFE from environment variables
 */
const getMFERemoteUrl = (mfeName: string): string | undefined => {
  const envVarName = `VITE_MFE_${mfeName.toUpperCase()}_URL`;
  return import.meta.env[envVarName];
};

/**
 * Create a loader function that handles both local (dev) and remote (prod) loading
 */
const createMFELoader = (
  mfeName: string,
): (() => Promise<{ default: ComponentType }>) => {
  return () => {
    const remoteUrl = getMFERemoteUrl(mfeName);
    
    // In development or if no remote URL is configured, use local import
    if (import.meta.env.DEV || !remoteUrl) {
      // Dynamic import to avoid bundling in production when not needed
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
    return loadRemoteModule(moduleUrl).then(module => ({
      default: module.default || module[Object.keys(module)[0]]
    }));
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
