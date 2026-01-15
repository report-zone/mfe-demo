import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const GeneralTab: React.FC = () => {
  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          General Preferences
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This is a sample screen for general preferences. Additional settings can be added here
          in the future.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Use this tab to manage general application preferences and settings.
        </Typography>
      </Paper>
    </Box>
  );
};

export default GeneralTab;
