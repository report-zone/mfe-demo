import { createTheme } from '@mui/material/styles';

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

export const defaultThemes = [
  {
    id: 'light',
    name: 'Light',
    theme: lightTheme,
    isCustom: false,
    themeConfig: lightThemeConfig,
  },
  {
    id: 'dark',
    name: 'Dark',
    theme: darkTheme,
    isCustom: false,
    themeConfig: darkThemeConfig,
  },
];
