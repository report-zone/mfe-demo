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

interface CustomThemeDefinition {
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
  muiComponentOverrides: Record<string, unknown>;
  createdAt?: string;
}

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

  const createThemeFromDefinition = (config: CustomThemeDefinition) => {
    return createTheme({
      palette: {
        primary: {
          main: config.colors?.primaryMain || '#1976d2',
          light: config.colors?.primaryLight || '#42a5f5',
          dark: config.colors?.primaryDark || '#1565c0',
        },
        secondary: {
          main: config.colors?.secondaryMain || '#dc004e',
          light: config.colors?.secondaryLight || '#ff4081',
          dark: config.colors?.secondaryDark || '#9a0036',
        },
        error: {
          main: config.colors?.errorMain || '#d32f2f',
        },
        warning: {
          main: config.colors?.warningMain || '#ed6c02',
        },
        info: {
          main: config.colors?.infoMain || '#0288d1',
        },
        success: {
          main: config.colors?.successMain || '#2e7d32',
        },
        background: {
          default: config.colors?.backgroundDefault || '#ffffff',
          paper: config.colors?.backgroundPaper || '#f5f5f5',
        },
        text: {
          primary: config.colors?.textPrimary || '#000000',
          secondary: config.colors?.textSecondary || 'rgba(0, 0, 0, 0.6)',
        },
      },
      typography: {
        fontSize: config.componentOverrides?.typography?.bodyFontSize || 16,
        h1: {
          fontSize: `${config.componentOverrides?.typography?.h1FontSize || 96}px`,
        },
        h2: {
          fontSize: `${config.componentOverrides?.typography?.h2FontSize || 60}px`,
        },
        h3: {
          fontSize: `${config.componentOverrides?.typography?.h3FontSize || 48}px`,
        },
        body1: {
          fontSize: `${config.componentOverrides?.typography?.bodyFontSize || 16}px`,
        },
      },
      shape: {
        borderRadius: config.componentOverrides?.button?.borderRadius || 4,
      },
      components: config.muiComponentOverrides || {},
    });
  };

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
          const themes: StoredTheme[] = JSON.parse(customThemes);
          const theme = themes.find((t) => t.id === selectedThemeId);
          if (theme && theme.themeConfig) {
            // Type guard to check if it's the new format
            const config = theme.themeConfig;
            const isNewFormat = (cfg: unknown): cfg is CustomThemeDefinition => {
              if (typeof cfg !== 'object' || cfg === null) return false;
              const obj = cfg as Record<string, unknown>;
              return !!(obj.colors && obj.componentOverrides && obj.muiComponentOverrides);
            };
            
            if (isNewFormat(config)) {
              setCurrentTheme(createThemeFromDefinition(config));
            } else {
              // Old format, use directly
              setCurrentTheme(createTheme(theme.themeConfig));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }

    // Listen for theme changes from preferences MFE
    const handleThemeChange = (event: Event) => {
      const themeEvent = event as ThemeChangeEvent;
      const theme = themeEvent.detail;
      if (theme && theme.themeConfig) {
        const config = theme.themeConfig;
        const isNewFormat = (cfg: unknown): cfg is CustomThemeDefinition => {
          if (typeof cfg !== 'object' || cfg === null) return false;
          const obj = cfg as Record<string, unknown>;
          return !!(obj.colors && obj.componentOverrides && obj.muiComponentOverrides);
        };
        
        if (isNewFormat(config)) {
          setCurrentTheme(createThemeFromDefinition(config));
        } else {
          setCurrentTheme(createTheme(theme.themeConfig));
        }
      }
    };

    window.addEventListener('themeChanged', handleThemeChange);
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
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
