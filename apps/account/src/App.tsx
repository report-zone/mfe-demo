import React from 'react';
import { Box, Typography, Paper, TextField, Button, Grid } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const App: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccountCircleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Account
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your account information and profile settings.
        </Typography>

        <Box component="form" sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                defaultValue="John"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                defaultValue="Doe"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                defaultValue="john.doe@example.com"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                type="tel"
                defaultValue="+1 (555) 123-4567"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                multiline
                rows={4}
                defaultValue="Software developer with a passion for building great applications."
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" size="large">
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default App;
