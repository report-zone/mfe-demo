import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import { logError } from '../utils/errorHandler';
import { useI18n } from '@mfe-demo/shared-hooks';

interface HeaderProps {
  onDrawerToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onDrawerToggle }) => {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t('header.appTitle')}
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {!isMobile && (
              <Typography variant="body2">
                {t('header.welcome', { username: user.username })}
              </Typography>
            )}
            <Button 
              color="inherit" 
              startIcon={!isMobile ? <LogoutIcon /> : undefined}
              onClick={handleLogout}
              sx={{ minWidth: 'auto' }}
            >
              {isMobile ? <LogoutIcon /> : t('header.logout')}
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
