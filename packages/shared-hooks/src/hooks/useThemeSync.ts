import { useState, useEffect } from 'react';
import { IStorageService } from '../services/interfaces/IStorageService';
import { IEventBus } from '../services/interfaces/IEventBus';

interface StoredTheme {
  id: string;
  themeConfig?: unknown;
}

interface ThemeChangeEvent {
  themeConfig?: unknown;
}

// Default theme configurations for fallback when themes are not in customThemes storage.
// Note: These configurations are duplicated from apps/preferences/src/themes/defaultThemes.ts
// to maintain MFE independence (each MFE should be able to run standalone).
// This follows the existing pattern in the codebase where each MFE has its own ThemeConverter.
const DEFAULT_THEME_CONFIGS: Record<string, unknown> = {
  light: {
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  },
  dark: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9',
      },
      secondary: {
        main: '#f48fb1',
      },
    },
  },
};

/**
 * Custom hook to sync theme with container app
 * This hook should be used by MFEs to ensure they apply the same theme as the container
 * 
 * @param defaultTheme - The default theme to use if no theme is found in storage
 * @param storageService - Storage service for reading theme data
 * @param eventBus - Event bus for listening to theme change events
 * @param convertToTheme - Function to convert theme config to your framework's theme object
 * @returns The current theme to apply
 */
export function useThemeSync<T>(
  defaultTheme: T,
  storageService: IStorageService,
  eventBus: IEventBus,
  convertToTheme: (themeConfig: unknown) => T
): T {
  const [currentTheme, setCurrentTheme] = useState<T>(defaultTheme);

  useEffect(() => {
    // Load theme from storage on mount
    const loadThemeFromStorage = () => {
      try {
        const selectedThemeId = storageService.getItem('selectedThemeId');
        
        if (selectedThemeId) {
          // Load from customThemes (includes both predefined and custom)
          const customThemesJson = storageService.getItem('customThemes');
          let themeLoaded = false;
          
          if (customThemesJson) {
            const themes: StoredTheme[] = JSON.parse(customThemesJson);
            const theme = themes.find((t) => t.id === selectedThemeId);
            if (theme && theme.themeConfig) {
              setCurrentTheme(convertToTheme(theme.themeConfig));
              themeLoaded = true;
            }
          }
          
          // Fallback to default themes (light/dark) if not found in storage
          if (!themeLoaded && selectedThemeId in DEFAULT_THEME_CONFIGS) {
            setCurrentTheme(convertToTheme(DEFAULT_THEME_CONFIGS[selectedThemeId]));
          }
        }
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
      }
    };

    loadThemeFromStorage();

    // Listen for theme changes from preferences MFE
    const handleThemeChange = (detail: ThemeChangeEvent) => {
      const theme = detail;
      if (theme && theme.themeConfig) {
        setCurrentTheme(convertToTheme(theme.themeConfig));
      }
    };

    const unsubscribe = eventBus.subscribe('themeChanged', handleThemeChange);
    
    return () => {
      unsubscribe();
    };
  }, [defaultTheme, storageService, eventBus, convertToTheme]);

  return currentTheme;
}

