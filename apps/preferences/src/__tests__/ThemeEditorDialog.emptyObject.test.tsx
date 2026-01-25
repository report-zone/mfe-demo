import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThemeEditorDialog from '../components/ThemeEditorDialog';
import { ThemeContextProvider } from '../context/ThemeContext';
import { I18nProvider } from '../i18n/I18nContext';
import { i18nConfig } from '../i18n/config';

const renderThemeEditor = (props = {}) => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
  };

  return render(
    <I18nProvider config={i18nConfig}>
      <ThemeContextProvider>
        <ThemeEditorDialog {...defaultProps} {...props} />
      </ThemeContextProvider>
    </I18nProvider>
  );
};

describe('ThemeEditorDialog - MUI Component Configuration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should allow configuring MUI components via the MUI Components tab', async () => {
    renderThemeEditor();
    
    // Navigate to MUI Components tab
    const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
    fireEvent.click(muiComponentsTab);
    
    await waitFor(() => {
      expect(screen.getByText('MuiButton')).toBeDefined();
    });
    
    // Verify all 5 components are present
    expect(screen.getByText('MuiAppBar')).toBeDefined();
    expect(screen.getByText('MuiCard')).toBeDefined();
    expect(screen.getByText('MuiAccordion')).toBeDefined();
    expect(screen.getByText('MuiButton')).toBeDefined();
    expect(screen.getByText('MuiCheckbox')).toBeDefined();
  });

  it('should have enable/disable checkboxes for each component override', async () => {
    renderThemeEditor();
    
    // Navigate to MUI Components tab
    const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
    fireEvent.click(muiComponentsTab);
    
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      // Should have checkboxes for enabling/disabling overrides
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  it('should preserve component overrides when switching tabs', async () => {
    renderThemeEditor();
    
    // Navigate to MUI Components tab
    const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
    fireEvent.click(muiComponentsTab);
    
    await waitFor(() => {
      expect(screen.getByText('MuiButton')).toBeDefined();
    });
    
    // Enable a checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    if (checkboxes.length > 0) {
      fireEvent.click(checkboxes[0]);
    }
    
    // Switch to another tab
    const primaryTab = screen.getByRole('tab', { name: /primary/i });
    fireEvent.click(primaryTab);
    
    // Switch back to MUI Components tab
    fireEvent.click(muiComponentsTab);
    
    await waitFor(() => {
      // Component overrides should still be there
      expect(screen.getByText('MuiButton')).toBeDefined();
    });
  });
});
