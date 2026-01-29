import { describe, it, expect } from 'vitest';
import { ThemeConverter } from '../utils/ThemeConverter';

describe('ThemeConverter', () => {
  describe('createThemeFromDefinition', () => {
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
  });
});
