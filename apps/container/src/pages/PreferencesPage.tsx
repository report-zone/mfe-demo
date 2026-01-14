import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const PreferencesPage: React.FC = () => {
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Preferences
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your application preferences and settings.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Notification Settings
        </Typography>
        <FormGroup>
          <FormControlLabel control={<Switch defaultChecked />} label="Email Notifications" />
          <FormControlLabel control={<Switch defaultChecked />} label="Push Notifications" />
          <FormControlLabel control={<Switch />} label="SMS Notifications" />
        </FormGroup>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Display Settings
        </Typography>
        <FormGroup>
          <FormControlLabel control={<Switch defaultChecked />} label="Dark Mode" />
          <FormControlLabel control={<Switch defaultChecked />} label="Compact View" />
        </FormGroup>
      </Paper>
    </Box>
  );
};

export default PreferencesPage;
