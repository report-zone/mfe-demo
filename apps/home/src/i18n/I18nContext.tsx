import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
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

const LANGUAGE_STORAGE_KEY = 'selectedLanguage';

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, config }) => {
  const [i18n] = useState(() => new I18n(config));
  
  // Initialize language from localStorage if available
  const getInitialLanguage = (): Language => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && ['en', 'fr', 'de', 'zh', 'es', 'ja'].includes(stored)) {
        return stored as Language;
      }
    } catch (error) {
      console.error('Failed to load language from localStorage', error);
    }
    return config.defaultLanguage;
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage());

  // Initialize i18n with the stored language
  useEffect(() => {
    i18n.setLanguage(language);
  }, [i18n, language]);

  const setLanguage = useCallback(
    (newLanguage: Language) => {
      i18n.setLanguage(newLanguage);
      setLanguageState(newLanguage);
      
      // Persist to localStorage
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      } catch (error) {
        console.error('Failed to save language to localStorage', error);
      }

      // Broadcast language change to other MFEs
      window.dispatchEvent(
        new CustomEvent('languageChanged', {
          detail: { language: newLanguage },
        })
      );
    },
    [i18n]
  );

  // Listen for language changes from other MFEs
  useEffect(() => {
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ language: Language }>;
      if (process.env.NODE_ENV === 'development') {
        console.log('[I18n] Home MFE received languageChanged event:', customEvent.detail);
      }
      if (customEvent.detail?.language) {
        const newLanguage = customEvent.detail.language;
        i18n.setLanguage(newLanguage);
        setLanguageState(newLanguage);
        
        // Persist to localStorage
        try {
          localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
        } catch (error) {
          console.error('Failed to save language to localStorage', error);
        }
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[I18n] Language change listener registered for home MFE');
    }
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      if (process.env.NODE_ENV === 'development') {
        console.log('[I18n] Language change listener removed for home MFE');
      }
    };
  }, [i18n]);

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
