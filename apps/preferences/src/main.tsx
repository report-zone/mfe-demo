import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App';
import { I18nProvider } from './i18n/I18nContext';
import { i18nConfig } from './i18n/config';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

// Wrapper component that provides I18nProvider for the MFE
const PreferencesMFE: React.FC = () => {
  return (
    <I18nProvider config={i18nConfig}>
      <App />
    </I18nProvider>
  );
};

// Standalone mode - for development
if (import.meta.env.DEV) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <I18nProvider config={i18nConfig}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </I18nProvider>
    </React.StrictMode>
  );
}

// Export wrapped component for container app
export default PreferencesMFE;
