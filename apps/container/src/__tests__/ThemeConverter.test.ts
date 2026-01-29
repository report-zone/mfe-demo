import { describe, it, expect } from 'vitest';
import { ThemeConverter } from '../services/ThemeConverter';

describe('ThemeConverter', () => {
  describe('createThemeFromDefinition', () => {
    it('should apply light mode by default', () => {
      const themeConfig = {
        name: 'Test Theme',
        version: '1.0.0',
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
        componentOverrides: {},
        muiComponentOverrides: {},
      };

      const theme = ThemeConverter.createThemeFromDefinition(themeConfig);
      
      expect(theme.palette.mode).toBe('light');
    });

    it('should apply dark mode when palette.mode is dark', () => {
      const themeConfig = {
        name: 'Dark Theme',
        version: '1.0.0',
        palette: {
          mode: 'dark' as const,
        },
        colors: {
          primaryMain: '#90caf9',
          primaryLight: '#e3f2fd',
          primaryDark: '#42a5f5',
          secondaryMain: '#f48fb1',
          secondaryLight: '#ffc1e3',
          secondaryDark: '#f06292',
          errorMain: '#f44336',
          warningMain: '#ff9800',
          infoMain: '#2196f3',
          successMain: '#4caf50',
          backgroundDefault: '#121212',
          backgroundPaper: '#1e1e1e',
          textPrimary: '#ffffff',
          textSecondary: 'rgba(255, 255, 255, 0.7)',
        },
        componentOverrides: {},
        muiComponentOverrides: {},
      };

      const theme = ThemeConverter.createThemeFromDefinition(themeConfig);
      
      expect(theme.palette.mode).toBe('dark');
    });

    it('should apply light mode when palette.mode is light', () => {
      const themeConfig = {
        name: 'Light Theme',
        version: '1.0.0',
        palette: {
          mode: 'light' as const,
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
        componentOverrides: {},
        muiComponentOverrides: {},
      };

      const theme = ThemeConverter.createThemeFromDefinition(themeConfig);
      
      expect(theme.palette.mode).toBe('light');
    });

    it('should apply all palette colors correctly', () => {
      const themeConfig = {
        name: 'Test Theme',
        version: '1.0.0',
        palette: {
          mode: 'dark' as const,
        },
        colors: {
          primaryMain: '#90caf9',
          primaryLight: '#e3f2fd',
          primaryDark: '#42a5f5',
          secondaryMain: '#f48fb1',
          secondaryLight: '#ffc1e3',
          secondaryDark: '#f06292',
          errorMain: '#f44336',
          warningMain: '#ff9800',
          infoMain: '#2196f3',
          successMain: '#4caf50',
          backgroundDefault: '#121212',
          backgroundPaper: '#1e1e1e',
          textPrimary: '#ffffff',
          textSecondary: 'rgba(255, 255, 255, 0.7)',
        },
        componentOverrides: {},
        muiComponentOverrides: {},
      };

      const theme = ThemeConverter.createThemeFromDefinition(themeConfig);
      
      expect(theme.palette.mode).toBe('dark');
      expect(theme.palette.primary.main).toBe('#90caf9');
      expect(theme.palette.secondary.main).toBe('#f48fb1');
      expect(theme.palette.error.main).toBe('#f44336');
      expect(theme.palette.background.default).toBe('#121212');
      expect(theme.palette.text.primary).toBe('#ffffff');
    });

    it('should use MUI defaults when dark mode has light mode colors', () => {
      const themeConfig = {
        name: 'Test Theme',
        version: '1.0.0',
        palette: {
          mode: 'dark' as const,
        },
        colors: {
          primaryMain: '#19d247',
          primaryLight: '#bcf542',
          primaryDark: '#15c149',
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
        componentOverrides: {},
        muiComponentOverrides: {},
      };

      const theme = ThemeConverter.createThemeFromDefinition(themeConfig);
      
      expect(theme.palette.mode).toBe('dark');
      // Should use MUI's dark mode defaults instead of the light colors
      expect(theme.palette.background.default).toBe('#121212');
      expect(theme.palette.text.primary).toBe('#fff');
    });

    it('should filter out invalid component override keys', () => {
      const themeConfig = {
        name: 'Test Theme',
        version: '1.0.0',
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
        componentOverrides: {},
        muiComponentOverrides: {
          MuiButton: { styleOverrides: { root: { borderRadius: 4 } } },
          MuiCard: { styleOverrides: { root: { borderRadius: 8 } } },
          breakpoints: { values: { xs: 0 } },
          palette: { mode: 'dark' },
          typography: { fontSize: 14 },
        },
      };

      const theme = ThemeConverter.createThemeFromDefinition(themeConfig);
      
      // Should include valid MUI component overrides
      expect(theme.components?.MuiButton).toBeDefined();
      expect(theme.components?.MuiCard).toBeDefined();
      
      // Should NOT include invalid keys (breakpoints, palette, typography)
      // These keys are not valid component names, so they should be filtered out
      const components = theme.components as Record<string, unknown> | undefined;
      expect(components?.breakpoints).toBeUndefined();
      expect(components?.palette).toBeUndefined();
      expect(components?.typography).toBeUndefined();
    });
  });

  describe('isNewThemeFormat', () => {
    it('should return true for new theme format', () => {
      const themeConfig = {
        colors: {},
        componentOverrides: {},
        muiComponentOverrides: {},
      };

      expect(ThemeConverter.isNewThemeFormat(themeConfig)).toBe(true);
    });

    it('should return false for non-object values', () => {
      expect(ThemeConverter.isNewThemeFormat(null)).toBe(false);
      expect(ThemeConverter.isNewThemeFormat(undefined)).toBe(false);
      expect(ThemeConverter.isNewThemeFormat('string')).toBe(false);
    });

    it('should return false for objects missing required properties', () => {
      expect(ThemeConverter.isNewThemeFormat({})).toBe(false);
      expect(ThemeConverter.isNewThemeFormat({ colors: {} })).toBe(false);
    });
  });

  describe('convertToTheme', () => {
    it('should convert new format theme with dark mode', () => {
      const themeConfig = {
        name: 'Dark Theme',
        version: '1.0.0',
        palette: {
          mode: 'dark' as const,
        },
        colors: {
          primaryMain: '#90caf9',
          primaryLight: '#e3f2fd',
          primaryDark: '#42a5f5',
          secondaryMain: '#f48fb1',
          secondaryLight: '#ffc1e3',
          secondaryDark: '#f06292',
          errorMain: '#f44336',
          warningMain: '#ff9800',
          infoMain: '#2196f3',
          successMain: '#4caf50',
          backgroundDefault: '#121212',
          backgroundPaper: '#1e1e1e',
          textPrimary: '#ffffff',
          textSecondary: 'rgba(255, 255, 255, 0.7)',
        },
        componentOverrides: {},
        muiComponentOverrides: {},
      };

      const theme = ThemeConverter.convertToTheme(themeConfig);
      
      expect(theme.palette.mode).toBe('dark');
    });

    it('should convert legacy format theme', () => {
      const legacyTheme = {
        palette: {
          mode: 'dark' as const,
          primary: { main: '#90caf9' },
        },
      };

      const theme = ThemeConverter.convertToTheme(legacyTheme);
      
      expect(theme.palette.mode).toBe('dark');
      expect(theme.palette.primary.main).toBe('#90caf9');
    });

    it('should fallback to default theme for serialized MUI theme objects', () => {
      // This simulates a serialized MUI Theme object that was stored in localStorage
      // and then parsed back - it has breakpoints.values, breakpoints.keys, etc.
      // but the methods like breakpoints.up() are lost during JSON serialization
      const serializedTheme = {
        palette: {
          mode: 'dark' as const,
          primary: { main: '#90caf9' },
        },
        breakpoints: {
          values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
          keys: ['xs', 'sm', 'md', 'lg', 'xl'],
          unit: 'px',
        },
        transitions: {
          duration: { shortest: 150, shorter: 200 },
          easing: { easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        },
        mixins: {
          toolbar: { minHeight: 56 },
        },
      };

      // Should NOT throw an error - should fallback to default theme
      const theme = ThemeConverter.convertToTheme(serializedTheme);
      
      // Should have valid breakpoints methods
      expect(typeof theme.breakpoints.up).toBe('function');
      expect(typeof theme.breakpoints.down).toBe('function');
    });

    it('should reject serialized MUI theme with breakpoints.keys', () => {
      const serializedTheme = {
        palette: { mode: 'light' as const },
        breakpoints: {
          values: { xs: 0, sm: 600 },
          keys: ['xs', 'sm'],
          unit: 'px',
        },
      };

      expect(ThemeConverter.isLegacyThemeFormat(serializedTheme)).toBe(false);
    });

    it('should reject serialized MUI theme with transitions.easing', () => {
      const serializedTheme = {
        palette: { mode: 'light' as const },
        transitions: {
          duration: { shortest: 150 },
          easing: { easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        },
      };

      expect(ThemeConverter.isLegacyThemeFormat(serializedTheme)).toBe(false);
    });

    it('should reject serialized MUI theme with mixins.toolbar', () => {
      const serializedTheme = {
        palette: { mode: 'light' as const },
        mixins: {
          toolbar: { minHeight: 56 },
        },
      };

      expect(ThemeConverter.isLegacyThemeFormat(serializedTheme)).toBe(false);
    });

    it('should accept valid legacy theme options without serialized properties', () => {
      const validLegacyTheme = {
        palette: {
          mode: 'dark' as const,
          primary: { main: '#90caf9' },
        },
        breakpoints: {
          values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
        },
      };

      expect(ThemeConverter.isLegacyThemeFormat(validLegacyTheme)).toBe(true);
    });
  });
});
