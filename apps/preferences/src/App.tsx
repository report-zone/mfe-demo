import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { ThemeContextProvider } from './context/ThemeContext';
import GeneralTab from './components/GeneralTab';
import ThemesTab from './components/ThemesTab';
import LanguagesTab from './components/LanguagesTab';
import { useI18n } from './i18n/I18nContext';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  // Get the relative path within the preferences app
  // When mounted in container at /preferences/*, strip the /preferences prefix
  const getRelativePath = () => {
    const path = location.pathname;
    if (path.startsWith('/preferences/')) {
      return path.substring('/preferences'.length);
    }
    if (path === '/preferences') {
      return '/';
    }
    return path;
  };

  // Determine active tab based on route
  const getTabValue = () => {
    const relativePath = getRelativePath();
    if (relativePath.includes('themes')) return 1;
    if (relativePath.includes('languages')) return 2;
    return 0;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) {
      navigate('/preferences/general');
    } else if (newValue === 1) {
      navigate('/preferences/themes');
    } else if (newValue === 2) {
      navigate('/preferences/languages');
    }
  };

  // Helper to check if we're at a root path
  const isRootPath = (pathname: string) => {
    return pathname === '/' || pathname === '/preferences' || pathname === '/preferences/';
  };

  React.useEffect(() => {
    // Default to general tab if at root or preferences root
    if (isRootPath(location.pathname)) {
      navigate('/preferences/general', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Render content based on the current path
  const renderContent = () => {
    const relativePath = getRelativePath();
    if (relativePath.includes('themes')) {
      return <ThemesTab />;
    } else if (relativePath.includes('languages')) {
      return <LanguagesTab />;
    }
    return <GeneralTab />;
  };

  return (
    <ThemeContextProvider>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              {t('preferences.title')}
            </Typography>
          </Box>

          <Tabs value={getTabValue()} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label={t('preferences.tabs.general')} />
            <Tab label={t('preferences.tabs.themes')} />
            <Tab label={t('preferences.tabs.languages')} />
          </Tabs>

          {renderContent()}
        </Paper>
      </Box>
    </ThemeContextProvider>
  );
};

export default App;
