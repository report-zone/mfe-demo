import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomTheme } from '../types/theme.types';
import { defaultThemes } from '../themes/defaultThemes';

interface ThemeContextType {
  currentTheme: CustomTheme;
  themes: CustomTheme[];
  setTheme: (theme: CustomTheme) => void;
  addCustomTheme: (theme: CustomTheme) => void;
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
}

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<CustomTheme>(defaultThemes[0]);
  const [themes, setThemes] = useState<CustomTheme[]>(defaultThemes);

  // Load custom themes from localStorage on mount
  const loadThemesFromStorage = () => {
    try {
      const storedThemes = localStorage.getItem('customThemes');
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
      const selectedThemeId = localStorage.getItem('selectedThemeId');
      if (selectedThemeId && themes.length > 0) {
        const theme = themes.find(t => t.id === selectedThemeId);
        if (theme) {
          setCurrentTheme(theme);
        }
      }
    } catch (error) {
      console.error('Error loading selected theme:', error);
    }
  }, [themes]);

  const setTheme = (theme: CustomTheme) => {
    setCurrentTheme(theme);
    // Persist the selected theme ID to localStorage
    try {
      localStorage.setItem('selectedThemeId', theme.id);
      // Dispatch custom event to notify container app of theme change
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
    } catch (error) {
      console.error('Error saving selected theme:', error);
    }
  };

  const addCustomTheme = (theme: CustomTheme) => {
    // Get custom themes from localStorage to ensure we have the latest
    try {
      const storedThemes = localStorage.getItem('customThemes');
      const existingCustomThemes = storedThemes ? JSON.parse(storedThemes) : [];
      const updatedCustomThemes = [...existingCustomThemes, theme];
      
      // Save to localStorage
      localStorage.setItem('customThemes', JSON.stringify(updatedCustomThemes));
      setThemes([...defaultThemes, ...updatedCustomThemes]);
    } catch (error) {
      console.error('Error saving theme to storage:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themes,
        setTheme,
        addCustomTheme,
        loadThemesFromStorage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
