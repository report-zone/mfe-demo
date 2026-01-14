import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface MFEPlaceholderProps {
  name: string;
}

const MFEPlaceholder: React.FC<MFEPlaceholderProps> = ({ name }) => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {name} MFE
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is a placeholder for the {name} micro frontend application.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          In production, this component will be loaded dynamically from its own deployment.
        </Typography>
      </Paper>
    </Box>
  );
};

export default MFEPlaceholder;
