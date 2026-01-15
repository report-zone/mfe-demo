import { Theme, ThemeOptions } from '@mui/material/styles';

export interface CustomTheme {
  id: string;
  name: string;
  theme: Theme;
  isCustom: boolean;
  themeConfig: Theme | ThemeOptions;
  description?: string;
}

export interface ThemeEditorState {
  name: string;
  description?: string;
  primary: string;
  primaryLight?: string;
  primaryDark?: string;
  secondary: string;
  secondaryLight?: string;
  secondaryDark?: string;
  error: string;
  warning: string;
  info: string;
  success: string;
  background: string;
  paper: string;
  mode: 'light' | 'dark';
  // Component configuration
  borderRadius?: number;
  fontSize?: number;
  padding?: number;
  h1FontSize?: string;
  h2FontSize?: string;
  h3FontSize?: string;
  h4FontSize?: string;
  jsonConfig: string;
}
