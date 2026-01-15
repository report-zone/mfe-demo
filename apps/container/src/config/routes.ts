/**
 * Route Configuration
 * 
 * Following the Open/Closed Principle (OCP),
 * route definitions are extracted to a configuration file.
 * New routes can be added without modifying App.tsx
 */

import React from 'react';
import HomePage from '../pages/HomePage';
import PreferencesPage from '../pages/PreferencesPage';
import AccountPage from '../pages/AccountPage';
import AdminPage from '../pages/AdminPage';

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  label?: string;
}

/**
 * Protected Routes Configuration
 * Add new protected routes here without modifying App.tsx
 */
export const protectedRoutes: RouteConfig[] = [
  {
    path: '/',
    element: HomePage,
    requireAuth: true,
    label: 'Home',
  },
  {
    path: '/preferences',
    element: PreferencesPage,
    requireAuth: true,
    label: 'Preferences',
  },
  {
    path: '/account',
    element: AccountPage,
    requireAuth: true,
    label: 'Account',
  },
  {
    path: '/admin',
    element: AdminPage,
    requireAuth: true,
    requireAdmin: true,
    label: 'Admin',
  },
];

/**
 * Public Routes Configuration
 */
export const publicRoutes: RouteConfig[] = [
  {
    path: '/login',
    label: 'Login',
  },
  {
    path: '/create-account',
    label: 'Create Account',
  },
  {
    path: '/reset-password',
    label: 'Reset Password',
  },
];
