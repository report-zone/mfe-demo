import React from 'react';
import { Box, Typography, Paper, TextField, Button, Grid } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useI18n } from '@mfe-demo/shared-hooks';

const App: React.FC = () => {
  const { t } = useI18n();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccountCircleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            {t('account.title')}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('account.description')}
        </Typography>

        <Box component="form" sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('account.firstName')}
                defaultValue="John"
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('account.lastName')}
                defaultValue="Doe"
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('account.email')}
                type="email"
                defaultValue="john.doe@example.com"
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('account.phoneNumber')}
                type="tel"
                defaultValue="+1 (555) 123-4567"
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('account.bio')}
                multiline
                rows={4}
                defaultValue={t('account.bioPlaceholder')}
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button variant="contained" size="large">
                {t('account.saveChanges')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default App;
