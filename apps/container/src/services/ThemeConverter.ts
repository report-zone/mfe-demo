/**
 * Theme Converter Service
 * 
 * Following Single Responsibility Principle (SRP),
 * theme conversion logic is separated from App component.
 * This service handles conversion of custom theme definitions to MUI themes.
 */

import { createTheme, Theme } from '@mui/material';

// CustomThemeDefinition interface
// Note: This interface is duplicated from preferences app's types to maintain
// independence between MFEs. Each MFE should be able to run standalone.
// The structure matches the theme JSON format defined in the requirements.
export interface CustomThemeDefinition {
  name: string;
  version: string;
  description?: string;
  colors: {
    primaryMain: string;
    primaryLight: string;
    primaryDark: string;
    secondaryMain: string;
    secondaryLight: string;
    secondaryDark: string;
    errorMain: string;
    warningMain: string;
    infoMain: string;
    successMain: string;
    backgroundDefault: string;
    backgroundPaper: string;
    textPrimary: string;
    textSecondary: string;
  };
  componentOverrides: {
    button?: {
      borderRadius?: number;
      textTransform?: string;
    };
    paper?: {
      borderRadius?: number;
      elevation?: number;
    };
    card?: {
      borderRadius?: number;
      elevation?: number;
    };
    textField?: {
      borderRadius?: number;
    };
    appBar?: {
      elevation?: number;
    };
    drawer?: {
      width?: number;
    };
    alert?: {
      borderRadius?: number;
    };
    dialog?: {
      borderRadius?: number;
    };
    tooltip?: {
      fontSize?: number;
    };
    chip?: {
      borderRadius?: number;
    };
    list?: {
      padding?: number;
    };
    typography?: {
      h1FontSize?: number;
      h2FontSize?: number;
      h3FontSize?: number;
      bodyFontSize?: number;
    };
  };
  muiComponentOverrides: Record<string, unknown>;
  createdAt?: string;
}

/**
 * Theme Converter Service
 */
export class ThemeConverter {
  /**
   * Type guard to check if theme config is in new custom format
   */
  static isNewThemeFormat(cfg: unknown): cfg is CustomThemeDefinition {
    if (typeof cfg !== 'object' || cfg === null) return false;
    const obj = cfg as Record<string, unknown>;
    return !!(obj.colors && obj.componentOverrides && obj.muiComponentOverrides);
  }

  /**
   * Converts a CustomThemeDefinition to a MUI Theme
   */
  static createThemeFromDefinition(config: CustomThemeDefinition): Theme {
    return createTheme({
      palette: {
        primary: {
          main: config.colors?.primaryMain || '#1976d2',
          light: config.colors?.primaryLight || '#42a5f5',
          dark: config.colors?.primaryDark || '#1565c0',
        },
        secondary: {
          main: config.colors?.secondaryMain || '#dc004e',
          light: config.colors?.secondaryLight || '#ff4081',
          dark: config.colors?.secondaryDark || '#9a0036',
        },
        error: {
          main: config.colors?.errorMain || '#d32f2f',
        },
        warning: {
          main: config.colors?.warningMain || '#ed6c02',
        },
        info: {
          main: config.colors?.infoMain || '#0288d1',
        },
        success: {
          main: config.colors?.successMain || '#2e7d32',
        },
        background: {
          default: config.colors?.backgroundDefault || '#ffffff',
          paper: config.colors?.backgroundPaper || '#f5f5f5',
        },
        text: {
          primary: config.colors?.textPrimary || '#000000',
          secondary: config.colors?.textSecondary || 'rgba(0, 0, 0, 0.6)',
        },
      },
      typography: {
        fontSize: config.componentOverrides?.typography?.bodyFontSize || 16,
        h1: {
          fontSize: `${config.componentOverrides?.typography?.h1FontSize || 96}px`,
        },
        h2: {
          fontSize: `${config.componentOverrides?.typography?.h2FontSize || 60}px`,
        },
        h3: {
          fontSize: `${config.componentOverrides?.typography?.h3FontSize || 48}px`,
        },
        body1: {
          fontSize: `${config.componentOverrides?.typography?.bodyFontSize || 16}px`,
        },
      },
      shape: {
        borderRadius: config.componentOverrides?.button?.borderRadius || 4,
      },
      components: config.muiComponentOverrides || {},
    });
  }

  /**
   * Converts any theme config format to a MUI Theme
   * Handles both new custom format and legacy MUI theme format
   */
  static convertToTheme(themeConfig: unknown): Theme {
    if (this.isNewThemeFormat(themeConfig)) {
      return this.createThemeFromDefinition(themeConfig);
    }
    // Legacy format - pass to createTheme with type assertion
    return createTheme(themeConfig as Record<string, unknown>);
  }
}
