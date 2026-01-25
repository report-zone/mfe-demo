import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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

  // Determine active tab based on route
  const getTabValue = () => {
    if (location.pathname.includes('themes')) return 1;
    if (location.pathname.includes('languages')) return 2;
    return 0;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) {
      navigate('general');
    } else if (newValue === 1) {
      navigate('themes');
    } else if (newValue === 2) {
      navigate('languages');
    }
  };

  // Helper to check if we're at a root path
  const isRootPath = (pathname: string) => {
    return pathname === '/' || pathname === '/preferences' || pathname === '/preferences/';
  };

  React.useEffect(() => {
    // Default to general tab if at root or preferences root
    if (isRootPath(location.pathname)) {
      navigate('general', { replace: true });
    }
  }, [location.pathname, navigate]);

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

          <Routes>
            <Route path="general" element={<GeneralTab />} />
            <Route path="themes" element={<ThemesTab />} />
            <Route path="languages" element={<LanguagesTab />} />
            <Route path="/" element={<GeneralTab />} />
          </Routes>
        </Paper>
      </Box>
    </ThemeContextProvider>
  );
};

export default App;
