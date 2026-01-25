import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';

const drawerWidth = 240;

interface NavItem {
  path: string;
  labelKey: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { path: '/', labelKey: 'navbar.home' },
  { path: '/preferences', labelKey: 'navbar.preferences' },
  { path: '/account', labelKey: 'navbar.account' },
  { path: '/admin', labelKey: 'navbar.admin', adminOnly: true },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { t } = useI18n();

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {filteredNavItems.map(item => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemText primary={t(item.labelKey)} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Navbar;
