import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import I18n, { Language, I18nConfig } from './index';
import { IStorageService } from '../services/interfaces/IStorageService';
import { IEventBus } from '../services/interfaces/IEventBus';
import { localStorageService } from '../services/localStorageService';
import { windowEventBus } from '../services/windowEventBus';

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  config: I18nConfig;
  storageService?: IStorageService;
  eventBus?: IEventBus;
}

const LANGUAGE_STORAGE_KEY = 'selectedLanguage';
const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr', 'de', 'zh', 'es', 'ja'];

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  config,
  storageService = localStorageService,
  eventBus = windowEventBus,
}) => {
  const [i18n] = useState(() => new I18n(config));
  
  // Initialize language from storage if available
  const getInitialLanguage = (): Language => {
    try {
      const stored = storageService.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
        return stored as Language;
      }
    } catch (error) {
      console.error('Failed to load language from storage', error);
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
      
      // Persist to storage
      try {
        storageService.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      } catch (error) {
        console.error('Failed to save language to storage', error);
      }

      // Broadcast language change to other MFEs
      eventBus.dispatch('languageChanged', { language: newLanguage });
    },
    [i18n, storageService, eventBus]
  );

  // Listen for language changes from other MFEs
  useEffect(() => {
    const handleLanguageChange = (detail: { language: Language }) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[I18n] Received languageChanged event:', detail);
      }
      if (detail?.language) {
        const newLanguage = detail.language;
        i18n.setLanguage(newLanguage);
        setLanguageState(newLanguage);
        
        // Persist to storage
        try {
          storageService.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
        } catch (error) {
          console.error('Failed to save language to storage', error);
        }
      }
    };

    const unsubscribe = eventBus.subscribe('languageChanged', handleLanguageChange);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[I18n] Language change listener registered');
    }
    
    return () => {
      unsubscribe();
      if (process.env.NODE_ENV === 'development') {
        console.log('[I18n] Language change listener removed');
      }
    };
  }, [i18n, storageService, eventBus]);

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
