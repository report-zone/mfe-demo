import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import { logError } from '../utils/errorHandler';
import { useI18n } from '../i18n/I18nContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useI18n();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      logError('Header - Logout', error);
    }
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t('header.appTitle')}
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {t('header.welcome', { username: user.username })}
            </Typography>
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
              {t('header.logout')}
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
