import { describe, it, expect } from 'vitest';
import { 
  createDefaultThemeDefinition, 
  convertThemeDefinitionToMuiTheme, 
  validateThemeDefinition,
  bumpVersion,
  cloneThemeDefinition 
} from '../utils/themeUtils';
import { CustomThemeDefinition } from '../types/theme.types';

describe('Theme Utilities', () => {
  describe('createDefaultThemeDefinition', () => {
    it('should create a valid default theme', () => {
      const theme = createDefaultThemeDefinition();
      
      expect(theme.name).toBe('Custom Theme');
      expect(theme.version).toBe('1.0.0');
      expect(theme.colors).toBeDefined();
      expect(theme.componentOverrides).toBeDefined();
      expect(theme.muiComponentOverrides).toBeDefined();
      expect(theme.createdAt).toBeDefined();
    });

    it('should have all required color properties', () => {
      const theme = createDefaultThemeDefinition();
      
      expect(theme.colors.primaryMain).toBe('#1976d2');
      expect(theme.colors.secondaryMain).toBe('#dc004e');
      expect(theme.colors.errorMain).toBe('#d32f2f');
      expect(theme.colors.backgroundDefault).toBe('#ffffff');
      expect(theme.colors.textPrimary).toBe('#000000');
    });
  });

  describe('convertThemeDefinitionToMuiTheme', () => {
    it('should convert theme definition to MUI theme', () => {
      const definition = createDefaultThemeDefinition();
      const muiTheme = convertThemeDefinitionToMuiTheme(definition);
      
      expect(muiTheme.palette.mode).toBe('light');
      expect(muiTheme.palette.primary.main).toBe('#1976d2');
      expect(muiTheme.palette.secondary.main).toBe('#dc004e');
    });

    it('should handle dark mode', () => {
      const definition = createDefaultThemeDefinition();
      definition.palette = { mode: 'dark' };
      
      const muiTheme = convertThemeDefinitionToMuiTheme(definition);
      expect(muiTheme.palette.mode).toBe('dark');
    });
  });

  describe('validateThemeDefinition', () => {
    it('should validate correct theme definition', () => {
      const definition = createDefaultThemeDefinition();
      const result = validateThemeDefinition(definition);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject theme without name', () => {
      const definition = createDefaultThemeDefinition();
      delete (definition as Partial<CustomThemeDefinition>).name;
      
      const result = validateThemeDefinition(definition);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('name');
    });

    it('should reject theme without colors', () => {
      const definition = createDefaultThemeDefinition();
      delete (definition as Partial<CustomThemeDefinition>).colors;
      
      const result = validateThemeDefinition(definition);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('colors');
    });

    it('should reject non-object input', () => {
      const result = validateThemeDefinition('invalid');
      expect(result.isValid).toBe(false);
    });
  });

  describe('bumpVersion', () => {
    it('should increment patch version', () => {
      expect(bumpVersion('1.0.0')).toBe('1.0.1');
      expect(bumpVersion('1.2.3')).toBe('1.2.4');
      expect(bumpVersion('2.5.9')).toBe('2.5.10');
    });

    it('should return unchanged for invalid version', () => {
      expect(bumpVersion('1.0')).toBe('1.0');
      expect(bumpVersion('invalid')).toBe('invalid');
      expect(bumpVersion('1.2.x')).toBe('1.2.x');
    });
  });

  describe('cloneThemeDefinition', () => {
    it('should create a deep clone', () => {
      const original = createDefaultThemeDefinition();
      const clone = cloneThemeDefinition(original);
      
      // Verify it's a different object
      expect(clone).not.toBe(original);
      expect(clone.colors).not.toBe(original.colors);
      expect(clone.componentOverrides).not.toBe(original.componentOverrides);
      
      // Verify values are the same
      expect(clone.name).toBe(original.name);
      expect(clone.colors.primaryMain).toBe(original.colors.primaryMain);
    });

    it('should not affect original when clone is modified', () => {
      const original = createDefaultThemeDefinition();
      const clone = cloneThemeDefinition(original);
      
      clone.name = 'Modified';
      clone.colors.primaryMain = '#000000';
      
      expect(original.name).toBe('Custom Theme');
      expect(original.colors.primaryMain).toBe('#1976d2');
    });
  });
});
