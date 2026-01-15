import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

export const defaultThemes = [
  {
    id: 'light',
    name: 'Light',
    theme: lightTheme,
    isCustom: false,
    themeConfig: lightTheme,
  },
  {
    id: 'dark',
    name: 'Dark',
    theme: darkTheme,
    isCustom: false,
    themeConfig: darkTheme,
  },
];
