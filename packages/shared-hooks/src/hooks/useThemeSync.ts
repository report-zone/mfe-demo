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
          
          if (customThemesJson) {
            const themes: StoredTheme[] = JSON.parse(customThemesJson);
            const theme = themes.find((t) => t.id === selectedThemeId);
            if (theme && theme.themeConfig) {
              setCurrentTheme(convertToTheme(theme.themeConfig));
              return;
            }
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
  }, [defaultTheme, storageService, eventBus]);

  return currentTheme;
}

