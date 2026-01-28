import React from 'react';
import { Select, MenuItem, SelectChangeEvent, FormControl } from '@mui/material';
import { useI18n } from '@mfe-demo/shared-hooks';
import { Language } from '@mfe-demo/shared-hooks';

const languageNames: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  es: 'Español',
  ja: '日本語',
};

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useI18n();

  const handleChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value as Language);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={language}
        onChange={handleChange}
        sx={{
          color: 'inherit',
          '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.7)' },
          '.MuiSvgIcon-root': { color: 'inherit' },
        }}
      >
        {Object.entries(languageNames).map(([code, name]) => (
          <MenuItem key={code} value={code}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;
