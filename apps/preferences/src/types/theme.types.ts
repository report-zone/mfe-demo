import { Theme } from '@mui/material/styles';

export interface CustomTheme {
  id: string;
  name: string;
  theme: Theme;
  isCustom: boolean;
  themeConfig: Record<string, any>;
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
