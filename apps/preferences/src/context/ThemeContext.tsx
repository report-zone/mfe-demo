import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import { CustomTheme, CustomThemeDefinition } from '../types/theme.types';
import { defaultThemes } from '../themes/defaultThemes';
import { convertThemeDefinitionToMuiTheme } from '../utils/themeUtils';
import { IStorageService, IEventBus, localStorageService, windowEventBus } from '@mfe-demo/shared-hooks';

/**
 * Regenerates the MUI Theme object from themeConfig.
 * This is necessary because serialized MUI Theme objects lose their methods
 * (like breakpoints.up()) during JSON serialization to localStorage.
 */
const regenerateThemeFromConfig = (storedTheme: CustomTheme): CustomTheme => {
  if (!storedTheme.themeConfig) {
    // No themeConfig available, return as-is (will use serialized theme)
    return storedTheme;
  }

  let regeneratedTheme: Theme;
  const config = storedTheme.themeConfig;

  // Check if themeConfig is a CustomThemeDefinition (has colors and componentOverrides)
  if (
    typeof config === 'object' &&
    config !== null &&
    'colors' in config &&
    'componentOverrides' in config
  ) {
    // It's a CustomThemeDefinition - use the dedicated converter
    regeneratedTheme = convertThemeDefinitionToMuiTheme(config as CustomThemeDefinition);
  } else {
    // It's a legacy ThemeOptions config - use createTheme directly
    regeneratedTheme = createTheme(config as ThemeOptions);
  }

  return {
    ...storedTheme,
    theme: regeneratedTheme,
  };
};

interface ThemeContextType {
  currentTheme: CustomTheme;
  themes: CustomTheme[];
  setTheme: (theme: CustomTheme) => void;
  addCustomTheme: (theme: CustomTheme) => void;
  updateCustomTheme: (theme: CustomTheme) => void;
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
  const loadThemesFromStorage = useCallback(() => {
    try {
      const storedThemes = storageService.getItem('customThemes');
      if (storedThemes) {
        const parsed: CustomTheme[] = JSON.parse(storedThemes);
        // Regenerate theme objects from themeConfig to restore lost methods
        const hydratedThemes = parsed.map(regenerateThemeFromConfig);
        setThemes([...defaultThemes, ...hydratedThemes]);
      }
    } catch (error) {
      console.error('Error loading themes from storage:', error);
    }
  }, [storageService]);

  useEffect(() => {
    loadThemesFromStorage();
  }, [loadThemesFromStorage]);

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
      const existingCustomThemes: CustomTheme[] = storedThemes ? JSON.parse(storedThemes) : [];
      const updatedCustomThemes = [...existingCustomThemes, theme];
      
      // Save to storage
      storageService.setItem('customThemes', JSON.stringify(updatedCustomThemes));
      // Hydrate all themes from storage to ensure consistent theme objects
      const hydratedThemes = updatedCustomThemes.map(regenerateThemeFromConfig);
      setThemes([...defaultThemes, ...hydratedThemes]);
    } catch (error) {
      console.error('Error saving theme to storage:', error);
    }
  };

  const removeCustomTheme = (themeId: string) => {
    try {
      const storedThemes = storageService.getItem('customThemes');
      const existingCustomThemes: CustomTheme[] = storedThemes ? JSON.parse(storedThemes) : [];
      const updatedCustomThemes = existingCustomThemes.filter((t: CustomTheme) => t.id !== themeId);
      
      // Save to storage
      storageService.setItem('customThemes', JSON.stringify(updatedCustomThemes));
      // Hydrate all themes from storage to ensure consistent theme objects
      const hydratedThemes = updatedCustomThemes.map(regenerateThemeFromConfig);
      setThemes([...defaultThemes, ...hydratedThemes]);
      
      // If the deleted theme was selected, switch to default
      if (currentTheme.id === themeId) {
        setTheme(defaultThemes[0]);
      }
    } catch (error) {
      console.error('Error removing theme from storage:', error);
    }
  };

  const updateCustomTheme = (updatedTheme: CustomTheme) => {
    try {
      const storedThemes = storageService.getItem('customThemes');
      const existingCustomThemes: CustomTheme[] = storedThemes ? JSON.parse(storedThemes) : [];
      const updatedCustomThemes = existingCustomThemes.map((t: CustomTheme) =>
        t.id === updatedTheme.id ? updatedTheme : t
      );
      
      // Save to storage
      storageService.setItem('customThemes', JSON.stringify(updatedCustomThemes));
      // Hydrate all themes from storage to ensure consistent theme objects
      const hydratedThemes = updatedCustomThemes.map(regenerateThemeFromConfig);
      setThemes([...defaultThemes, ...hydratedThemes]);
      
      // If the updated theme was selected, update the current theme as well
      if (currentTheme.id === updatedTheme.id) {
        const hydratedUpdatedTheme = regenerateThemeFromConfig(updatedTheme);
        setCurrentTheme(hydratedUpdatedTheme);
        eventBus.dispatch('themeChanged', hydratedUpdatedTheme);
      }
    } catch (error) {
      console.error('Error updating theme in storage:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themes,
        setTheme,
        addCustomTheme,
        updateCustomTheme,
        removeCustomTheme,
        loadThemesFromStorage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
