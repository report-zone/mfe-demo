import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider } from './i18n/I18nContext';
import { i18nConfig } from './i18n/config';
import Header from './components/Header';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Loading from './components/Loading';
import { defaultTheme, darkTheme } from './config/theme';
import MFELoader from './components/MFELoader';
import { ThemeConverter } from './services/ThemeConverter';
import { logger } from './services/loggerService';

interface StoredTheme {
  id: string;
  themeConfig?: unknown;
}

interface ThemeChangeEvent extends CustomEvent {
  detail: {
    themeConfig?: unknown;
  };
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/create-account" element={!isAuthenticated ? <CreateAccountPage /> : <Navigate to="/" replace />} />
      <Route path="/reset-password" element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/" replace />} />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <CssBaseline />
              <Header onDrawerToggle={handleDrawerToggle} />
              <Navbar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  p: 3,
                  mt: 8, // Add margin-top to account for fixed header
                  width: { xs: '100%', md: 'calc(100% - 240px)' },
                }}
              >
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <MFELoader mfeName="home" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/preferences/*"
                    element={
                      <ProtectedRoute>
                        <MFELoader mfeName="preferences" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <MFELoader mfeName="account" />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin>
                        <MFELoader mfeName="admin" />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
            </Box>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);

  useEffect(() => {
    // Check if we're at root URL but app expects to be at /container/
    // This handles the case where CloudFront serves /container/index.html for root requests
    const expectedBase = import.meta.env.BASE_URL || '/';
    const currentPath = window.location.pathname;
    
    // If we're at root but app expects /container/, redirect
    if (expectedBase === '/container/' && (currentPath === '/' || currentPath === '')) {
      window.location.replace('/container/');
      return; // Exit early, no need to continue initialization
    }

    // Load theme from localStorage on mount
    try {
      const selectedThemeId = localStorage.getItem('selectedThemeId');
      
      if (selectedThemeId) {
        // First, try to load from customThemes (includes both predefined and custom)
        const customThemesJson = localStorage.getItem('customThemes');
        let themeLoaded = false;
        
        if (customThemesJson) {
          const themes: StoredTheme[] = JSON.parse(customThemesJson);
          const theme = themes.find((t) => t.id === selectedThemeId);
          if (theme && theme.themeConfig) {
            setCurrentTheme(ThemeConverter.convertToTheme(theme.themeConfig));
            themeLoaded = true;
          }
        }
        
        // Fallback to hardcoded default themes if not found in storage
        if (!themeLoaded) {
          if (selectedThemeId === 'light') {
            setCurrentTheme(defaultTheme);
          } else if (selectedThemeId === 'dark') {
            setCurrentTheme(darkTheme);
          }
        }
      }
    } catch (error) {
      logger.error('Failed to load theme from localStorage', 'App', error instanceof Error ? error : undefined);
    }

    // Listen for theme changes from preferences MFE
    const handleThemeChange = (event: Event) => {
      const themeEvent = event as ThemeChangeEvent;
      const theme = themeEvent.detail;
      if (theme && theme.themeConfig) {
        setCurrentTheme(ThemeConverter.convertToTheme(theme.themeConfig));
      }
    };

    window.addEventListener('themeChanged', handleThemeChange);
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  return (
    <I18nProvider config={i18nConfig}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </I18nProvider>
  );
};

export default App;
