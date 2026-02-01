import { useState, useEffect } from 'react';
import { Theme } from '@mui/material';
import { defaultTheme, darkTheme, customThemeConfig } from '../config/theme';
import { ThemeConverter } from '../services/ThemeConverter';
import { logger } from '../services/loggerService';
import {
  IStorageService,
  IEventBus,
  localStorageService,
  windowEventBus,
} from '@mfe-demo/shared-hooks';

interface StoredTheme {
  id: string;
  themeConfig?: unknown;
}

interface ThemeChangeEvent {
  themeConfig?: unknown;
}

/**
 * Custom hook to manage theme state
 * Implements Single Responsibility Principle - only handles theme management
 * Implements Dependency Inversion Principle - depends on abstractions
 */
export function useThemeManagement(
  storageService: IStorageService = localStorageService,
  eventBus: IEventBus = windowEventBus
): Theme {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    // Load theme from storage on mount
    try {
      const selectedThemeId = storageService.getItem('selectedThemeId');

      if (selectedThemeId) {
        // First, try to load from customThemes (includes both predefined and custom)
        const customThemesJson = storageService.getItem('customThemes');
        let themeLoaded = false;

        if (customThemesJson) {
          const themes: StoredTheme[] = JSON.parse(customThemesJson);
          const theme = themes.find(t => t.id === selectedThemeId);
          if (theme && theme.themeConfig) {
            setCurrentTheme(ThemeConverter.convertToTheme(theme.themeConfig));
            themeLoaded = true;
          }
        }

        // Fallback to hardcoded default themes if not found in storage
        if (!themeLoaded) {
          if (selectedThemeId === 'light') {
            setCurrentTheme(defaultTheme);
          } else if (selectedThemeId === 'dark') {
            setCurrentTheme(darkTheme);
          } else if (selectedThemeId === 'custom') {
            setCurrentTheme(ThemeConverter.convertToTheme(customThemeConfig));
          }
        }
      }
    } catch (error) {
      logger.error(
        'Failed to load theme from storage',
        'useThemeManagement',
        error instanceof Error ? error : undefined
      );
    }

    // Listen for theme changes from preferences MFE
    const handleThemeChange = (detail: ThemeChangeEvent) => {
      const theme = detail;
      if (theme && theme.themeConfig) {
        setCurrentTheme(ThemeConverter.convertToTheme(theme.themeConfig));
      }
    };

    const unsubscribe = eventBus.subscribe('themeChanged', handleThemeChange);

    return () => {
      unsubscribe();
    };
  }, [storageService, eventBus]);

  return currentTheme;
}
