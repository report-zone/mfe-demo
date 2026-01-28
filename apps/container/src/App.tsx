import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

/**
 * Component to track current route and determine which MFE should be visible
 */
const MFEContainer: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Track which MFEs have been visited (and thus should stay mounted)
  const [mountedMFEs, setMountedMFEs] = useState<Set<string>>(new Set());

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Determine which MFE should be visible based on current route
  const getCurrentMFE = (): string => {
    const path = location.pathname;
    // Match /preferences and any sub-routes like /preferences/theme
    if (path === '/preferences' || path.startsWith('/preferences/')) return 'preferences';
    if (path === '/account') return 'account';
    if (path === '/admin') return 'admin';
    if (path === '/') return 'home';
    // Unknown paths default to home, trigger redirect
    return 'unknown';
  };

  const currentMFE = getCurrentMFE();

  // Mount the current MFE if not already mounted
  // This ensures language settings are applied when MFE first loads
  useEffect(() => {
    if (currentMFE !== 'unknown' && !mountedMFEs.has(currentMFE)) {
      setMountedMFEs(prev => new Set(prev).add(currentMFE));
    }
  }, [currentMFE]); // Only depend on currentMFE to avoid infinite loop

  // Redirect to home if user is on unknown path
  if (currentMFE === 'unknown') {
    return <Navigate to="/" replace />;
  }

  // Redirect non-admin users from admin path to home
  if (currentMFE === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
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
        {/* Lazy mount MFEs on first access, then keep them mounted */}
        {/* Each MFE will pick up language settings from localStorage on initial mount */}
        {mountedMFEs.has('home') && (
          <Box sx={{ display: currentMFE === 'home' ? 'block' : 'none' }}>
            <MFELoader mfeName="home" />
          </Box>
        )}
        {mountedMFEs.has('preferences') && (
          <Box sx={{ display: currentMFE === 'preferences' ? 'block' : 'none' }}>
            <MFELoader mfeName="preferences" />
          </Box>
        )}
        {mountedMFEs.has('account') && (
          <Box sx={{ display: currentMFE === 'account' ? 'block' : 'none' }}>
            <MFELoader mfeName="account" />
          </Box>
        )}
        {/* Only mount admin MFE if user is an admin and has visited admin page */}
        {/* If admin permissions are lost while mounted, redirect will handle it */}
        {isAdmin && mountedMFEs.has('admin') && (
          <Box sx={{ display: currentMFE === 'admin' ? 'block' : 'none' }}>
            <MFELoader mfeName="admin" />
          </Box>
        )}
        {/* If non-admin but admin MFE was previously mounted, show nothing (permissions changed) */}
        {!isAdmin && mountedMFEs.has('admin') && currentMFE === 'admin' && (
          <Navigate to="/" replace />
        )}
      </Box>
    </Box>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/create-account" element={!isAuthenticated ? <CreateAccountPage /> : <Navigate to="/" replace />} />
      <Route path="/reset-password" element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/" replace />} />

      {/* Protected routes - MFEs are lazy mounted on first access and stay mounted */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <MFEContainer />
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
    if (expectedBase === '/container/' && currentPath === '/') {
      window.location.replace(expectedBase);
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
