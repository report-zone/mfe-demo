import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

// Standalone mode - for development
// Translations are only used when running in container, not in standalone dev mode
if (import.meta.env.DEV) {
  const rootElement = document.getElementById('root');
  if (rootElement && !rootElement.hasChildNodes()) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </React.StrictMode>
    );
  }
}

// Export App directly without I18nProvider wrapper
// The container app already provides I18nProvider, so we use that shared context
export default App;
