import { Theme, ThemeOptions } from '@mui/material/styles';

export interface CustomTheme {
  id: string;
  name: string;
  theme: Theme;
  isCustom: boolean;
  themeConfig: Theme | ThemeOptions | CustomThemeDefinition;
  description?: string;
}

// New custom theme definition format
export interface CustomThemeDefinition {
  name: string;
  version: string;
  description?: string;
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
  muiComponentOverrides: Record<string, any>;
  createdAt?: string;
}

export interface ThemeEditorState {
  name: string;
  version: string;
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
  textPrimary: string;
  textSecondary: string;
  mode: 'light' | 'dark';
  // Component configuration
  borderRadius?: number;
  fontSize?: number;
  padding?: number;
  buttonTextTransform?: string;
  paperElevation?: number;
  cardElevation?: number;
  appBarElevation?: number;
  drawerWidth?: number;
  dialogBorderRadius?: number;
  chipBorderRadius?: number;
  listPadding?: number;
  tooltipFontSize?: number;
  h1FontSize?: number;
  h2FontSize?: number;
  h3FontSize?: number;
  bodyFontSize?: number;
  jsonConfig: string;
}
