import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider } from '@mfe-demo/shared-hooks';
import { i18nConfig } from './i18n/config';
import Header from './components/Header';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Loading from './components/Loading';
import MFELoader from './components/MFELoader';
import { getMFEForRoute } from './config/routeMappings';
import { useBaseUrlRedirect } from './hooks/useBaseUrlRedirect';
import { useThemeManagement } from './hooks/useThemeManagement';
import { useMFEMounting } from './hooks/useMFEMounting';

const MFEContainer: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Determine which MFE should be visible based on current route
  const getCurrentMFE = (): string => {
    return getMFEForRoute(location.pathname);
  };

  const currentMFE = getCurrentMFE();
  
  // Track which MFEs have been visited (and thus should stay mounted)
  const mountedMFEs = useMFEMounting(currentMFE);

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
  // Handle base URL redirects
  useBaseUrlRedirect();
  
  // Manage theme state
  const currentTheme = useThemeManagement();

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
