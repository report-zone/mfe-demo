import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

interface NavItem {
  path: string;
  label: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home' },
  { path: '/preferences', label: 'Preferences' },
  { path: '/account', label: 'Account' },
  { path: '/admin', label: 'Admin', adminOnly: true },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

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
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Navbar;
