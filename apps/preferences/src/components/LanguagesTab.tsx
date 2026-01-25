import React from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { useI18n } from '../i18n/I18nContext';
import { Language } from '../i18n/index';

const languageNames: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  es: 'Español',
  ja: '日本語',
};

const LanguagesTab: React.FC = () => {
  const { t, language, setLanguage } = useI18n();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value as Language);
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('preferences.languages.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('preferences.languages.description')}
        </Typography>

        <FormControl component="fieldset" sx={{ mt: 3 }}>
          <FormLabel component="legend">{t('preferences.languages.selectLanguage')}</FormLabel>
          <RadioGroup
            aria-label="language"
            name="language"
            value={language}
            onChange={handleLanguageChange}
          >
            {Object.entries(languageNames).map(([code, name]) => (
              <FormControlLabel
                key={code}
                value={code}
                control={<Radio />}
                label={name}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>{t('preferences.languages.currentLanguage')}:</strong> {languageNames[language]}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LanguagesTab;
