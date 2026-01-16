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
  });
});
