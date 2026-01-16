/**
 * Theme Utility Functions
 * 
 * Following Single Responsibility Principle (SRP):
 * - Each function has a single, well-defined purpose
 * - Theme validation, creation, and conversion are separated
 */

import { CustomThemeDefinition } from '../types/theme.types';
import { createTheme, Theme } from '@mui/material/styles';

/**
 * Creates a default theme definition with sensible defaults
 * Following Open/Closed Principle (OCP): Can be extended without modification
 */
export const createDefaultThemeDefinition = (): CustomThemeDefinition => {
  return {
    name: 'Custom Theme',
    version: '1.0.0',
    description: '',
    palette: {
      mode: 'light',
    },
    colors: {
      primaryMain: '#1976d2',
      primaryLight: '#42a5f5',
      primaryDark: '#1565c0',
      secondaryMain: '#dc004e',
      secondaryLight: '#ff4081',
      secondaryDark: '#9a0036',
      errorMain: '#d32f2f',
      warningMain: '#ed6c02',
      infoMain: '#0288d1',
      successMain: '#2e7d32',
      backgroundDefault: '#ffffff',
      backgroundPaper: '#f5f5f5',
      textPrimary: '#000000',
      textSecondary: 'rgba(0, 0, 0, 0.6)',
    },
    componentOverrides: {
      button: {
        borderRadius: 4,
        textTransform: 'uppercase',
      },
      paper: {
        borderRadius: 4,
        elevation: 1,
      },
      card: {
        borderRadius: 4,
        elevation: 1,
      },
      textField: {
        borderRadius: 4,
      },
      appBar: {
        elevation: 4,
      },
      drawer: {
        width: 240,
      },
      alert: {
        borderRadius: 4,
      },
      dialog: {
        borderRadius: 8,
      },
      tooltip: {
        fontSize: 12,
      },
      chip: {
        borderRadius: 16,
      },
      list: {
        padding: 8,
      },
      typography: {
        h1FontSize: 96,
        h2FontSize: 60,
        h3FontSize: 48,
        bodyFontSize: 16,
      },
    },
    muiComponentOverrides: {},
    createdAt: new Date().toISOString(),
  };
};

/**
 * Converts a CustomThemeDefinition to a Material-UI Theme
 * Following Single Responsibility Principle: Only handles theme conversion
 */
export const convertThemeDefinitionToMuiTheme = (definition: CustomThemeDefinition): Theme => {
  return createTheme({
    palette: {
      mode: definition.palette?.mode || 'light',
      primary: {
        main: definition.colors.primaryMain,
        light: definition.colors.primaryLight,
        dark: definition.colors.primaryDark,
      },
      secondary: {
        main: definition.colors.secondaryMain,
        light: definition.colors.secondaryLight,
        dark: definition.colors.secondaryDark,
      },
      error: {
        main: definition.colors.errorMain,
      },
      warning: {
        main: definition.colors.warningMain,
      },
      info: {
        main: definition.colors.infoMain,
      },
      success: {
        main: definition.colors.successMain,
      },
      background: {
        default: definition.colors.backgroundDefault,
        paper: definition.colors.backgroundPaper,
      },
      text: {
        primary: definition.colors.textPrimary,
        secondary: definition.colors.textSecondary,
      },
    },
    typography: {
      fontSize: definition.componentOverrides?.typography?.bodyFontSize || 16,
      h1: {
        fontSize: `${definition.componentOverrides?.typography?.h1FontSize || 96}px`,
      },
      h2: {
        fontSize: `${definition.componentOverrides?.typography?.h2FontSize || 60}px`,
      },
      h3: {
        fontSize: `${definition.componentOverrides?.typography?.h3FontSize || 48}px`,
      },
      body1: {
        fontSize: `${definition.componentOverrides?.typography?.bodyFontSize || 16}px`,
      },
    },
    shape: {
      borderRadius: definition.componentOverrides?.button?.borderRadius || 4,
    },
    components: definition.muiComponentOverrides || {},
  });
};

/**
 * Validates a theme definition
 * Following Single Responsibility Principle: Only handles validation
 * 
 * @returns Object with isValid flag and error message if invalid
 */
export const validateThemeDefinition = (definition: unknown): { isValid: boolean; error?: string } => {
  if (typeof definition !== 'object' || definition === null) {
    return { isValid: false, error: 'Theme definition must be an object' };
  }

  const def = definition as Partial<CustomThemeDefinition>;

  if (!def.name || typeof def.name !== 'string') {
    return { isValid: false, error: 'Theme name is required and must be a string' };
  }

  if (!def.colors || typeof def.colors !== 'object') {
    return { isValid: false, error: 'Theme colors are required' };
  }

  // Validate required color fields
  const requiredColors: (keyof CustomThemeDefinition['colors'])[] = [
    'primaryMain', 'primaryLight', 'primaryDark',
    'secondaryMain', 'secondaryLight', 'secondaryDark',
    'errorMain', 'warningMain', 'infoMain', 'successMain',
    'backgroundDefault', 'backgroundPaper',
    'textPrimary', 'textSecondary'
  ];

  for (const color of requiredColors) {
    const value = def.colors[color];
    if (typeof value !== 'string' || value === '') {
      return { isValid: false, error: `Missing or invalid required color: ${color}` };
    }
  }

  return { isValid: true };
};

/**
 * Bumps the version number (patch version)
 * Following Single Responsibility Principle: Only handles version bumping
 */
export const bumpVersion = (version: string): string => {
  const parts = version.split('.');
  if (parts.length !== 3) {
    return version; // Return unchanged if not in x.y.z format
  }
  
  const major = parseInt(parts[0], 10);
  const minor = parseInt(parts[1], 10);
  const patch = parseInt(parts[2], 10);
  
  // Validate all parts are valid numbers
  if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
    return version; // Return unchanged if any part is invalid
  }
  
  return `${major}.${minor}.${patch + 1}`;
};

/**
 * Deep clones a theme definition
 * Following Single Responsibility Principle: Only handles cloning
 */
export const cloneThemeDefinition = (definition: CustomThemeDefinition): CustomThemeDefinition => {
  return JSON.parse(JSON.stringify(definition));
};
