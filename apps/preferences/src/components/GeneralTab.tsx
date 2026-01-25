import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useI18n } from '../i18n/I18nContext';

const GeneralTab: React.FC = () => {
  const { t } = useI18n();

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('preferences.general.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('preferences.general.description')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('preferences.general.usage')}
        </Typography>
      </Paper>
    </Box>
  );
};

export default GeneralTab;
