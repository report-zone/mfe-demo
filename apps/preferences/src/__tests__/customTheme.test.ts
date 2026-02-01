import { describe, it, expect } from 'vitest';
import { customThemeDefinition } from '../themes/customTheme';
import { convertThemeDefinitionToMuiTheme } from '../utils/themeUtils';

describe('Custom Theme', () => {
  it('should have correct theme name and version', () => {
    expect(customThemeDefinition.name).toBe('Custom');
    expect(customThemeDefinition.version).toBe('1.0.0');
    expect(customThemeDefinition.description).toContain('Custom brand colors');
  });

  it('should have all required colors defined', () => {
    const { colors } = customThemeDefinition;

    // Primary colors
    expect(colors.primaryMain).toBe('#689cc5');
    expect(colors.primaryLight).toBeDefined();
    expect(colors.primaryDark).toBeDefined();

    // Secondary colors
    expect(colors.secondaryMain).toBe('#5e6fa3');
    expect(colors.secondaryLight).toBeDefined();
    expect(colors.secondaryDark).toBeDefined();

    // Status colors
    expect(colors.errorMain).toBeDefined();
    expect(colors.warningMain).toBeDefined();
    expect(colors.infoMain).toBe('#93dbe9'); // Light cyan from SVG
    expect(colors.successMain).toBeDefined();

    // Background colors
    expect(colors.backgroundDefault).toBeDefined();
    expect(colors.backgroundPaper).toBeDefined();

    // Text colors
    expect(colors.textPrimary).toBe('#3b4368'); // Dark blue from SVG
    expect(colors.textSecondary).toBeDefined();
  });

  it('should have component overrides defined', () => {
    const { componentOverrides } = customThemeDefinition;

    expect(componentOverrides.button).toBeDefined();
    expect(componentOverrides.button?.borderRadius).toBe(8);
    expect(componentOverrides.button?.textTransform).toBe('none');

    expect(componentOverrides.paper).toBeDefined();
    expect(componentOverrides.card).toBeDefined();
    expect(componentOverrides.appBar).toBeDefined();
    expect(componentOverrides.chip).toBeDefined();
    expect(componentOverrides.list).toBeDefined();
  });

  it('should have MUI component overrides for all requested components', () => {
    const { muiComponentOverrides } = customThemeDefinition;

    // Check that styling is defined for the requested components
    expect(muiComponentOverrides.MuiTypography).toBeDefined();
    expect(muiComponentOverrides.MuiAccordion).toBeDefined();
    expect(muiComponentOverrides.MuiAppBar).toBeDefined();
    expect(muiComponentOverrides.MuiMenu).toBeDefined();
    expect(muiComponentOverrides.MuiButton).toBeDefined();
    expect(muiComponentOverrides.MuiCard).toBeDefined();
    expect(muiComponentOverrides.MuiPaper).toBeDefined();
    expect(muiComponentOverrides.MuiDrawer).toBeDefined();
    expect(muiComponentOverrides.MuiCheckbox).toBeDefined();
    expect(muiComponentOverrides.MuiSwitch).toBeDefined();
    expect(muiComponentOverrides.MuiSlider).toBeDefined();
    expect(muiComponentOverrides.MuiList).toBeDefined();
    expect(muiComponentOverrides.MuiChip).toBeDefined();
  });

  it('should convert to a valid MUI theme', () => {
    const muiTheme = convertThemeDefinitionToMuiTheme(customThemeDefinition);

    expect(muiTheme.palette.mode).toBe('light');
    expect(muiTheme.palette.primary.main).toBe('#689cc5');
    expect(muiTheme.palette.secondary.main).toBe('#5e6fa3');
    expect(muiTheme.palette.info.main).toBe('#93dbe9');
  });

  it('should have proper typography settings', () => {
    const muiTheme = convertThemeDefinitionToMuiTheme(customThemeDefinition);

    expect(muiTheme.typography).toBeDefined();
    expect(muiTheme.typography.fontSize).toBe(14);
  });

  it('should have AppBar with transparent backgroundColor to prevent Paper background conflicts', () => {
    const { muiComponentOverrides } = customThemeDefinition;

    expect(muiComponentOverrides.MuiAppBar).toBeDefined();
    const appBarOverrides = muiComponentOverrides.MuiAppBar as any;
    expect(appBarOverrides.styleOverrides?.root?.backgroundColor).toBe('transparent');
    expect(appBarOverrides.styleOverrides?.root?.backgroundImage).toBeDefined();
  });

  it('should be in light mode', () => {
    expect(customThemeDefinition.palette?.mode).toBe('light');
  });
});
