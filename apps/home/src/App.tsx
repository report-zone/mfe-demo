import React from 'react';
import { Box, Typography, Paper, Card, CardContent, Grid } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useI18n } from '@mfe-demo/shared-hooks';

const App: React.FC = () => {
  const { t } = useI18n();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HomeIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            {t('home.title')}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('home.welcome')}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('home.dashboard.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('home.dashboard.description')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('home.recentActivity.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('home.recentActivity.description')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('home.quickActions.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('home.quickActions.description')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default App;
