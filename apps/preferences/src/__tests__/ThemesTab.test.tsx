import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ThemesTab from '../components/ThemesTab';
import { ThemeContextProvider } from '../context/ThemeContext';
import { I18nProvider } from '@mfe-demo/shared-hooks';
import { i18nConfig } from '../i18n/config';
import { CustomTheme, CustomThemeDefinition } from '../types/theme.types';
import { createTheme } from '@mui/material/styles';

// Mock URL.createObjectURL which is not available in jsdom
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Create a mock custom theme for testing
const createMockCustomTheme = (): CustomTheme => {
  const themeConfig: CustomThemeDefinition = {
    name: 'Test Custom Theme',
    version: '1.0.0',
    description: 'A test custom theme',
    colors: {
      primaryMain: '#1976d2',
      primaryLight: '#42a5f5',
      primaryDark: '#1565c0',
      secondaryMain: '#dc004e',
      secondaryLight: '#ff4081',
      secondaryDark: '#9a0036',
      errorMain: '#d32f2f',
      warningMain: '#ed6c02',
      infoMain: '#0288d1',
      successMain: '#2e7d32',
      backgroundDefault: '#ffffff',
      backgroundPaper: '#f5f5f5',
      textPrimary: '#000000',
      textSecondary: 'rgba(0, 0, 0, 0.6)',
    },
    componentOverrides: {
      button: { borderRadius: 4 },
      paper: { borderRadius: 4 },
    },
    muiComponentOverrides: {},
    createdAt: new Date().toISOString(),
  };

  return {
    id: 'test-custom-theme',
    name: 'Test Custom Theme',
    description: 'A test custom theme',
    theme: createTheme({
      palette: {
        primary: { main: '#1976d2' },
      },
    }),
    isCustom: true,
    themeConfig,
  };
};

const renderThemesTab = () => {
  return render(
    <I18nProvider config={i18nConfig}>
      <BrowserRouter>
        <ThemeContextProvider>
          <ThemesTab />
        </ThemeContextProvider>
      </BrowserRouter>
    </I18nProvider>
  );
};

describe('ThemesTab - Edit Custom Theme Functionality', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should not show edit button for default themes', () => {
    renderThemesTab();
    
    // Check that Light and Dark themes exist
    expect(screen.getByText('Light')).toBeDefined();
    expect(screen.getByText('Dark')).toBeDefined();
    
    // Edit button should not exist (only custom themes have edit buttons)
    const editButtons = screen.queryAllByRole('button', { name: /edit custom theme/i });
    expect(editButtons.length).toBe(0);
  });

  it('should show edit button for custom themes', async () => {
    // Add a custom theme to localStorage before rendering
    const customTheme = createMockCustomTheme();
    localStorage.setItem('customThemes', JSON.stringify([customTheme]));
    
    renderThemesTab();
    
    await waitFor(() => {
      expect(screen.getByText('Test Custom Theme')).toBeDefined();
    });
    
    // Edit button should exist for custom theme
    const editButton = screen.getByRole('button', { name: /edit custom theme/i });
    expect(editButton).toBeDefined();
  });

  it('should show delete button alongside edit button for custom themes', async () => {
    const customTheme = createMockCustomTheme();
    localStorage.setItem('customThemes', JSON.stringify([customTheme]));
    
    renderThemesTab();
    
    await waitFor(() => {
      expect(screen.getByText('Test Custom Theme')).toBeDefined();
    });
    
    // Both edit and delete buttons should exist
    const editButton = screen.getByRole('button', { name: /edit custom theme/i });
    const deleteButton = screen.getByRole('button', { name: /delete custom theme/i });
    expect(editButton).toBeDefined();
    expect(deleteButton).toBeDefined();
  });

  it('should open theme editor dialog when clicking edit button', async () => {
    const customTheme = createMockCustomTheme();
    localStorage.setItem('customThemes', JSON.stringify([customTheme]));
    
    renderThemesTab();
    
    await waitFor(() => {
      expect(screen.getByText('Test Custom Theme')).toBeDefined();
    });
    
    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit custom theme/i });
    fireEvent.click(editButton);
    
    // Theme editor dialog should open
    await waitFor(() => {
      expect(screen.getByText('Theme Editor')).toBeDefined();
    }, { timeout: 10000 });
  }, 15000);

  it('should load theme data into editor when editing', async () => {
    const customTheme = createMockCustomTheme();
    localStorage.setItem('customThemes', JSON.stringify([customTheme]));
    
    renderThemesTab();
    
    await waitFor(() => {
      expect(screen.getByText('Test Custom Theme')).toBeDefined();
    });
    
    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit custom theme/i });
    fireEvent.click(editButton);
    
    // Check that the theme name is pre-populated in the editor
    await waitFor(() => {
      const themeNameInput = screen.getByRole('textbox', { name: /theme name/i });
      expect(themeNameInput).toBeDefined();
      expect(themeNameInput).toHaveValue('Test Custom Theme');
    }, { timeout: 10000 });
  }, 15000);

  it('should open empty editor when clicking Create Custom Theme', async () => {
    renderThemesTab();
    
    // Click Create Custom Theme button
    const createButton = screen.getByRole('button', { name: /create custom theme/i });
    fireEvent.click(createButton);
    
    // Theme editor dialog should open with default theme name
    await waitFor(() => {
      expect(screen.getByText('Theme Editor')).toBeDefined();
      const themeNameInput = screen.getByRole('textbox', { name: /theme name/i });
      expect(themeNameInput).toHaveValue('Custom Theme');
    }, { timeout: 10000 });
  }, 15000);
});
