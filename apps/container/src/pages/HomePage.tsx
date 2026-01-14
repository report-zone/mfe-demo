import React from 'react';
import { Box, Typography, Paper, Card, CardContent, Grid } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const HomePage: React.FC = () => {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HomeIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Home
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" paragraph>
          Welcome to the Home micro frontend application. This is an independently deployable
          application that is part of the larger MFE architecture.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View your personalized dashboard with quick access to key features.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stay up to date with your recent activities and updates.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Access frequently used features with one click.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
