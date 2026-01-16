import { Theme, ThemeOptions } from '@mui/material/styles';

export interface CustomTheme {
  id: string;
  name: string;
  theme: Theme;
  isCustom: boolean;
  themeConfig: Theme | ThemeOptions | CustomThemeDefinition;
  description?: string;
}

/**
 * Custom theme definition format
 * This is the single source of truth for theme structure,
 * used both in localStorage and the theme editor
 */
export interface CustomThemeDefinition {
  name: string;
  version: string;
  description?: string;
  palette?: {
    mode?: 'light' | 'dark';
  };
  colors: {
    primaryMain: string;
    primaryLight: string;
    primaryDark: string;
    secondaryMain: string;
    secondaryLight: string;
    secondaryDark: string;
    errorMain: string;
    warningMain: string;
    infoMain: string;
    successMain: string;
    backgroundDefault: string;
    backgroundPaper: string;
    textPrimary: string;
    textSecondary: string;
  };
  componentOverrides: {
    button?: {
      borderRadius?: number;
      textTransform?: string;
    };
    paper?: {
      borderRadius?: number;
      elevation?: number;
    };
    card?: {
      borderRadius?: number;
      elevation?: number;
    };
    textField?: {
      borderRadius?: number;
    };
    appBar?: {
      elevation?: number;
    };
    drawer?: {
      width?: number;
    };
    alert?: {
      borderRadius?: number;
    };
    dialog?: {
      borderRadius?: number;
    };
    tooltip?: {
      fontSize?: number;
    };
    chip?: {
      borderRadius?: number;
    };
    list?: {
      padding?: number;
    };
    typography?: {
      h1FontSize?: number;
      h2FontSize?: number;
      h3FontSize?: number;
      bodyFontSize?: number;
    };
  };
  muiComponentOverrides: Record<string, unknown>;
  createdAt?: string;
}
