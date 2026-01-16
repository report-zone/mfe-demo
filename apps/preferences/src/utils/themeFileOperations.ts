/**
 * Theme File Operations Utility
 * 
 * Following Single Responsibility Principle (SRP):
 * - Handles all file I/O operations for themes
 * - Separated from UI logic and theme manipulation
 */

import { CustomThemeDefinition } from '../types/theme.types';

/**
 * Session storage key for tracking saved theme filenames
 */
const SAVED_THEMES_SESSION_KEY = 'savedThemeFilenames';

/**
 * Sanitizes a filename to make it safe for file systems
 * Following Single Responsibility Principle: Only handles filename sanitization
 */
export const sanitizeFilename = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Downloads a theme definition as a JSON file
 * Following Single Responsibility Principle: Only handles file download
 */
export const downloadThemeAsFile = (definition: CustomThemeDefinition, filename: string): void => {
  const blob = new Blob([JSON.stringify(definition, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Loads a theme definition from a file
 * Following Single Responsibility Principle: Only handles file loading
 * 
 * @returns Promise that resolves with the theme definition or rejects with an error
 */
export const loadThemeFromFile = (): Promise<CustomThemeDefinition> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const result = event.target?.result;
          if (typeof result === 'string') {
            const definition = JSON.parse(result) as CustomThemeDefinition;
            resolve(definition);
          } else {
            reject(new Error('Failed to read file content'));
          }
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  });
};

/**
 * Checks if a filename was already saved in the current session
 * Following Single Responsibility Principle: Only handles session tracking
 */
export const isFilenameSavedInSession = (filename: string): boolean => {
  try {
    const savedThemes = JSON.parse(sessionStorage.getItem(SAVED_THEMES_SESSION_KEY) || '[]');
    return savedThemes.includes(filename);
  } catch {
    return false;
  }
};

/**
 * Tracks a filename as saved in the current session
 * Following Single Responsibility Principle: Only handles session tracking
 */
export const trackSavedFilename = (filename: string): void => {
  try {
    const savedThemes = JSON.parse(sessionStorage.getItem(SAVED_THEMES_SESSION_KEY) || '[]');
    if (!savedThemes.includes(filename)) {
      savedThemes.push(filename);
      sessionStorage.setItem(SAVED_THEMES_SESSION_KEY, JSON.stringify(savedThemes));
    }
  } catch (error) {
    console.error('Failed to track saved filename:', error);
  }
};
