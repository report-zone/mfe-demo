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
// 
// Future Improvement: Consider creating a shared types package to avoid duplication
// while maintaining MFE independence through proper dependency management.
export interface CustomThemeDefinition {
  name: string;
  version: string;
  description?: string;
  palette?: {
    mode?: 'light' | 'dark';
  };
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
   * Calculates relative brightness of a color
   * Uses simplified approach: checks if hex value is above threshold
   */
  private static getColorBrightness(color: string): number {
    const hex = color.toLowerCase().replace(/^#/, '').replace(/\s/g, '');
    
    // Handle 3-digit hex
    const fullHex = hex.length === 3 
      ? hex.split('').map(c => c + c).join('')
      : hex;
    
    if (fullHex.length !== 6) return 0;
    
    // Extract RGB
    const r = parseInt(fullHex.substring(0, 0 + 2), 16);
    const g = parseInt(fullHex.substring(2, 2 + 2), 16);
    const b = parseInt(fullHex.substring(4, 4 + 2), 16);
    
    // Simple brightness calculation (average of RGB)
    // Light colors have high brightness (>200), dark colors have low (<100)
    return (r + g + b) / 3;
  }

  /**
   * Checks if background colors appear to be for light mode
   * Light mode typically has bright backgrounds (near white)
   */
  private static isLightModeBackground(bgDefault: string, bgPaper: string): boolean {
    const defaultBrightness = this.getColorBrightness(bgDefault);
    const paperBrightness = this.getColorBrightness(bgPaper);
    
    // If both backgrounds are bright (>200), it's light mode
    return defaultBrightness > 200 && paperBrightness > 200;
  }

  /**
   * Checks if text colors appear to be for light mode
   * Light mode typically has dark text (black or near-black)
   */
  private static isLightModeText(textPrimary: string): boolean {
    const text = textPrimary.toLowerCase().trim();
    
    // Check for common black/dark representations
    if (text === '#000000' || text === '#000' || 
        text === 'rgba(0, 0, 0, 0.87)' || text === 'rgba(0,0,0,0.87)') {
      return true;
    }
    
    // Check hex colors with brightness
    if (text.startsWith('#')) {
      return this.getColorBrightness(text) < 100;
    }
    
    return false;
  }

  /**
   * Converts a CustomThemeDefinition to a MUI Theme
   * 
   * When palette mode is 'dark' but colors are for light mode (or vice versa),
   * this function omits background and text colors to let MUI use appropriate defaults.
   */
  static createThemeFromDefinition(config: CustomThemeDefinition): Theme {
    const mode = config.palette?.mode || 'light';
    
    // Use defaults for colors if not provided
    const bgDefault = config.colors?.backgroundDefault || '#ffffff';
    const bgPaper = config.colors?.backgroundPaper || '#f5f5f5';
    const txtPrimary = config.colors?.textPrimary || '#000000';
    
    // Check if background and text colors are compatible with the mode
    const hasLightModeBackground = this.isLightModeBackground(bgDefault, bgPaper);
    const hasLightModeText = this.isLightModeText(txtPrimary);
    
    // If mode is dark but colors are for light mode, use MUI defaults
    // If mode is light but colors are for dark mode, use MUI defaults
    const shouldUseDefaultBackgroundAndText = 
      (mode === 'dark' && hasLightModeBackground && hasLightModeText) ||
      (mode === 'light' && !hasLightModeBackground && !hasLightModeText);
    
    return createTheme({
      palette: {
        mode,
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
        // Only set background/text if they're compatible with the mode
        ...(!shouldUseDefaultBackgroundAndText && {
          background: {
            default: bgDefault,
            paper: bgPaper,
          },
          text: {
            primary: txtPrimary,
            secondary: config.colors?.textSecondary || 'rgba(0, 0, 0, 0.6)',
          },
        }),
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
   * Type guard to check if theme config is a valid legacy MUI theme format
   */
  static isLegacyThemeFormat(cfg: unknown): boolean {
    if (typeof cfg !== 'object' || cfg === null) return false;
    const obj = cfg as Record<string, unknown>;
    // Legacy format typically has palette, typography, spacing, etc.
    return !!(obj.palette || obj.typography || obj.spacing || obj.components);
  }

  /**
   * Converts any theme config format to a MUI Theme
   * Handles both new custom format and legacy MUI theme format
   */
  static convertToTheme(themeConfig: unknown): Theme {
    if (this.isNewThemeFormat(themeConfig)) {
      return this.createThemeFromDefinition(themeConfig);
    }
    // Legacy format - validate before conversion
    if (this.isLegacyThemeFormat(themeConfig)) {
      return createTheme(themeConfig as Record<string, unknown>);
    }
    // Fallback to default theme if format is unrecognized
    return createTheme();
  }
}
