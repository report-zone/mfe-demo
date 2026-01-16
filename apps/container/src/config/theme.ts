/**
 * Theme Configuration
 * 
 * Following the Open/Closed Principle (OCP),
 * theme configuration is extracted to a separate file
 * for easy extension and customization without modifying App.tsx
 */

import { createTheme, Theme } from '@mui/material';

/**
 * Default application theme
 * Can be extended or overridden without modifying the main application
 */
export const defaultTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

/**
 * Dark theme configuration
 */
export const darkTheme: Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
  },
});

/**
 * Create a custom theme with overrides
 * Allows extending the default theme without modification
 */
export const createCustomTheme = (overrides?: Parameters<typeof createTheme>[0]): Theme => {
  return createTheme({
    ...defaultTheme,
    ...overrides,
  });
};

export default defaultTheme;
