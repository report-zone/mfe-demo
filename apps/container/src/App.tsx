import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, createTheme } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Header from './components/Header';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Loading from './components/Loading';
import HomePage from './pages/HomePage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';
import { defaultTheme } from './config/theme';
import MFELoader from './components/MFELoader';

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
              <Header />
              <Navbar />
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  p: 3,
                  mt: 8, // Add margin-top to account for fixed header
                }}
              >
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <HomePage />
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
                        <AccountPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminPage />
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
    // Load theme from localStorage on mount
    try {
      const selectedThemeId = localStorage.getItem('selectedThemeId');
      const customThemes = localStorage.getItem('customThemes');
      
      if (selectedThemeId) {
        // Check if it's a default theme
        if (selectedThemeId === 'light') {
          setCurrentTheme(defaultTheme);
        } else if (selectedThemeId === 'dark') {
          setCurrentTheme(createTheme({
            palette: {
              mode: 'dark',
              primary: { main: '#90caf9' },
              secondary: { main: '#f48fb1' },
            },
          }));
        } else if (customThemes) {
          // Load custom theme
          const themes = JSON.parse(customThemes);
          const theme = themes.find((t: { id: string; themeConfig?: unknown }) => t.id === selectedThemeId);
          if (theme && theme.themeConfig) {
            setCurrentTheme(createTheme(theme.themeConfig));
          }
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }

    // Listen for theme changes from preferences MFE
    const handleThemeChange = (event: CustomEvent) => {
      const theme = event.detail;
      if (theme && theme.themeConfig) {
        setCurrentTheme(createTheme(theme.themeConfig));
      }
    };

    window.addEventListener('themeChanged', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange as EventListener);
    };
  }, []);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
