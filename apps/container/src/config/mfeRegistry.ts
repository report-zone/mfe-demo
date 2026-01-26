/**
 * MFE Registry
 * 
 * Following the Open/Closed Principle (OCP),
 * this registry allows adding new MFEs without modifying MFELoader.
 * New MFEs can be registered by adding entries to this configuration.
 */

import { ComponentType, lazy } from 'react';

export interface MFEConfig {
  name: string;
  loadComponent: () => Promise<{ default: ComponentType }>;
  description?: string;
}

/**
 * MFE Registry - Add new MFEs here without modifying MFELoader
 */
export const mfeRegistry: Record<string, MFEConfig> = {
  home: {
    name: 'Home',
    loadComponent: () => import('@mfe-demo/home'),
    description: 'Home page micro frontend',
  },
  preferences: {
    name: 'Preferences',
    loadComponent: () => import('@mfe-demo/preferences'),
    description: 'User preferences micro frontend',
  },
  account: {
    name: 'Account',
    loadComponent: () => import('@mfe-demo/account'),
    description: 'User account management micro frontend',
  },
  admin: {
    name: 'Admin',
    loadComponent: () => import('@mfe-demo/admin'),
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
