import { Theme, ThemeOptions } from '@mui/material/styles';

export interface CustomTheme {
  id: string;
  name: string;
  theme: Theme;
  isCustom: boolean;
  themeConfig: Theme | ThemeOptions;
}

export interface ThemeEditorState {
  name: string;
  primary: string;
  secondary: string;
  error: string;
  warning: string;
  info: string;
  success: string;
  background: string;
  paper: string;
  mode: 'light' | 'dark';
  jsonConfig: string;
}
