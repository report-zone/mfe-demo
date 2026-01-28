import React, { useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Theme } from '@mui/material';
import App from './App';
import { I18nProvider, useThemeSync, localStorageService, windowEventBus } from '@mfe-demo/shared-hooks';
import { i18nConfig } from './i18n/config';
import { ThemeConverter } from './utils/ThemeConverter';

const defaultTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

// Wrapper component that provides I18nProvider and ThemeProvider for the MFE
const AccountMFE: React.FC = () => {
  // Theme converter function
  const convertToTheme = useCallback((themeConfig: unknown): Theme => {
    return ThemeConverter.convertToTheme(themeConfig);
  }, []);
  
  // Sync theme with container app
  const theme = useThemeSync(defaultTheme, localStorageService, windowEventBus, convertToTheme);
  
  return (
    <ThemeProvider theme={theme}>
      <I18nProvider config={i18nConfig}>
        <App />
      </I18nProvider>
    </ThemeProvider>
  );
};

// Standalone mode - for development
// Only create root if we're running standalone (not imported as a module)
// Check if root element exists and hasn't been used yet
if (import.meta.env.DEV) {
  const rootElement = document.getElementById('root');
  if (rootElement && !rootElement.hasChildNodes()) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <I18nProvider config={i18nConfig}>
          <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ThemeProvider>
        </I18nProvider>
      </React.StrictMode>
    );
  }
}

// Export wrapped component for container app
export default AccountMFE;
