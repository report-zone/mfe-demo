import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { ThemeContextProvider } from './context/ThemeContext';
import GeneralTab from './components/GeneralTab';
import ThemesTab from './components/ThemesTab';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on route
  const getTabValue = () => {
    if (location.pathname.includes('/themes')) return 1;
    return 0;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) {
      navigate('/general');
    } else if (newValue === 1) {
      navigate('/themes');
    }
  };

  React.useEffect(() => {
    // Default to general tab if at root
    if (location.pathname === '/') {
      navigate('/general', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <ThemeContextProvider>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              Preferences
            </Typography>
          </Box>

          <Tabs value={getTabValue()} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="General" />
            <Tab label="Themes" />
          </Tabs>

          <Routes>
            <Route path="/general" element={<GeneralTab />} />
            <Route path="/themes" element={<ThemesTab />} />
            <Route path="/" element={<GeneralTab />} />
          </Routes>
        </Paper>
      </Box>
    </ThemeContextProvider>
  );
};

export default App;
