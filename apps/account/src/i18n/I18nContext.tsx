import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import I18n, { Language, I18nConfig } from './index';

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  config: I18nConfig;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, config }) => {
  const [i18n] = useState(() => new I18n(config));
  const [language, setLanguageState] = useState<Language>(config.defaultLanguage);

  const setLanguage = useCallback(
    (newLanguage: Language) => {
      i18n.setLanguage(newLanguage);
      setLanguageState(newLanguage);
    },
    [i18n]
  );

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      return i18n.translate(key, params);
    },
    [i18n, language] // Re-run when language changes
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
