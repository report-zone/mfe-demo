import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomTheme } from '../types/theme.types';
import { defaultThemes } from '../themes/defaultThemes';
import { IStorageService, IEventBus, localStorageService, windowEventBus } from '@mfe-demo/shared-hooks';

interface ThemeContextType {
  currentTheme: CustomTheme;
  themes: CustomTheme[];
  setTheme: (theme: CustomTheme) => void;
  addCustomTheme: (theme: CustomTheme) => void;
  removeCustomTheme: (themeId: string) => void;
  loadThemesFromStorage: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeContextProvider');
  }
  return context;
};

interface ThemeContextProviderProps {
  children: ReactNode;
  storageService?: IStorageService;
  eventBus?: IEventBus;
}

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({ 
  children,
  storageService = localStorageService,
  eventBus = windowEventBus,
}) => {
  const [currentTheme, setCurrentTheme] = useState<CustomTheme>(defaultThemes[0]);
  const [themes, setThemes] = useState<CustomTheme[]>(defaultThemes);

  // Load custom themes from storage on mount
  const loadThemesFromStorage = () => {
    try {
      const storedThemes = storageService.getItem('customThemes');
      if (storedThemes) {
        const parsed = JSON.parse(storedThemes);
        setThemes([...defaultThemes, ...parsed]);
      }
    } catch (error) {
      console.error('Error loading themes from storage:', error);
    }
  };

  useEffect(() => {
    loadThemesFromStorage();
  }, []);

  // Load selected theme after themes are loaded
  useEffect(() => {
    try {
      const selectedThemeId = storageService.getItem('selectedThemeId');
      if (selectedThemeId && themes.length > 0) {
        const theme = themes.find(t => t.id === selectedThemeId);
        if (theme) {
          setCurrentTheme(theme);
        }
      }
    } catch (error) {
      console.error('Error loading selected theme:', error);
    }
  }, [themes, storageService]);

  const setTheme = (theme: CustomTheme) => {
    setCurrentTheme(theme);
    // Persist the selected theme ID to storage
    try {
      storageService.setItem('selectedThemeId', theme.id);
      // Dispatch custom event to notify container app of theme change
      eventBus.dispatch('themeChanged', theme);
    } catch (error) {
      console.error('Error saving selected theme:', error);
    }
  };

  const addCustomTheme = (theme: CustomTheme) => {
    // Get custom themes from storage to ensure we have the latest
    try {
      const storedThemes = storageService.getItem('customThemes');
      const existingCustomThemes = storedThemes ? JSON.parse(storedThemes) : [];
      const updatedCustomThemes = [...existingCustomThemes, theme];
      
      // Save to storage
      storageService.setItem('customThemes', JSON.stringify(updatedCustomThemes));
      setThemes([...defaultThemes, ...updatedCustomThemes]);
    } catch (error) {
      console.error('Error saving theme to storage:', error);
    }
  };

  const removeCustomTheme = (themeId: string) => {
    try {
      const storedThemes = storageService.getItem('customThemes');
      const existingCustomThemes = storedThemes ? JSON.parse(storedThemes) : [];
      const updatedCustomThemes = existingCustomThemes.filter((t: CustomTheme) => t.id !== themeId);
      
      // Save to storage
      storageService.setItem('customThemes', JSON.stringify(updatedCustomThemes));
      setThemes([...defaultThemes, ...updatedCustomThemes]);
      
      // If the deleted theme was selected, switch to default
      if (currentTheme.id === themeId) {
        setTheme(defaultThemes[0]);
      }
    } catch (error) {
      console.error('Error removing theme from storage:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themes,
        setTheme,
        addCustomTheme,
        removeCustomTheme,
        loadThemesFromStorage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
