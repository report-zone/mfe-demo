import { createTheme } from '@mui/material/styles';
import { customThemeDefinition } from './customTheme';
import { convertThemeDefinitionToMuiTheme } from '../utils/themeUtils';

const lightThemeConfig = {
  palette: {
    mode: 'light' as const,
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
};

const darkThemeConfig = {
  palette: {
    mode: 'dark' as const,
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
};

export const lightTheme = createTheme(lightThemeConfig);
export const darkTheme = createTheme(darkThemeConfig);
export const customTheme = convertThemeDefinitionToMuiTheme(customThemeDefinition);

export const defaultThemes = [
  {
    id: 'light',
    name: 'Light',
    theme: lightTheme,
    isCustom: false,
    themeConfig: lightThemeConfig,
    description: 'Default light theme',
  },
  {
    id: 'dark',
    name: 'Dark',
    theme: darkTheme,
    isCustom: false,
    themeConfig: darkThemeConfig,
    description: 'Default dark theme',
  },
  {
    id: 'custom',
    name: 'Custom',
    theme: customTheme,
    isCustom: false,
    themeConfig: customThemeDefinition,
    description: 'Example theme based on Custom brand colors',
  },
];
