import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThemeEditorDialog from '../components/ThemeEditorDialog';
import { ThemeContextProvider } from '../context/ThemeContext';
import { I18nProvider } from '@mfe-demo/shared-hooks';
import { i18nConfig } from '../i18n/config';

// Mock URL.createObjectURL which is not available in jsdom
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

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

describe('ThemeEditorDialog - Overwrite File Functionality', () => {
  beforeEach(() => {
    // Clear localStorage and sessionStorage before each test
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should not show overwrite dialog when saving a theme for the first time', async () => {
    renderThemeEditor();
    
    // Set theme name
    const nameInput = screen.getByLabelText(/theme name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'My New Theme' } });
    
    // Click Save button
    const saveButton = screen.getByRole('button', { name: /^save$/i });
    fireEvent.click(saveButton);
    
    // Wait a bit to ensure no dialog appears
    await waitFor(() => {
      const overwriteDialog = screen.queryByText(/File Already Exists/i);
      expect(overwriteDialog).toBeNull();
    }, { timeout: 500 });
  });

  it('should show overwrite dialog when saving a theme with existing filename', async () => {
    // Mock sessionStorage to simulate a previously saved file
    sessionStorage.setItem('savedThemeFilenames', JSON.stringify(['my-new-theme.json']));
    
    renderThemeEditor();
    
    // Set theme name to match the existing file
    const nameInput = screen.getByLabelText(/theme name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'My New Theme' } });
    
    // Click Save button
    const saveButton = screen.getByRole('button', { name: /^save$/i });
    fireEvent.click(saveButton);
    
    // Wait for overwrite dialog to appear
    await waitFor(() => {
      const dialogTitle = screen.getByText(/File Already Exists/i);
      expect(dialogTitle).toBeDefined();
    });
    
    // Verify the dialog message is displayed
    const dialogMessage = screen.getByText(/This file was already saved in this session/i);
    expect(dialogMessage).toBeDefined();
  });

  it('should show correct button labels in overwrite dialog', async () => {
    // Mock sessionStorage to simulate a previously saved file
    sessionStorage.setItem('savedThemeFilenames', JSON.stringify(['my-theme.json']));
    
    renderThemeEditor();
    
    // Set theme name
    const nameInput = screen.getByLabelText(/theme name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'My Theme' } });
    
    // Click Save button
    const saveButton = screen.getByRole('button', { name: /^save$/i });
    fireEvent.click(saveButton);
    
    // Wait for overwrite dialog to appear
    await waitFor(() => {
      const dialogTitle = screen.getByText(/File Already Exists/i);
      expect(dialogTitle).toBeDefined();
    });
    
    // Verify button labels with new translations
    const overwriteButton = screen.getByRole('button', { name: /^Overwrite$/i });
    expect(overwriteButton).toBeDefined();
    
    const renameButton = screen.getByRole('button', { name: /^Rename$/i });
    expect(renameButton).toBeDefined();
    
    const cancelButton = screen.getAllByRole('button', { name: /cancel/i })[0];
    expect(cancelButton).toBeDefined();
  });

  it('should close overwrite dialog when Cancel is clicked', async () => {
    // Mock sessionStorage to simulate a previously saved file
    sessionStorage.setItem('savedThemeFilenames', JSON.stringify(['my-theme.json']));
    
    renderThemeEditor();
    
    // Set theme name
    const nameInput = screen.getByLabelText(/theme name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'My Theme' } });
    
    // Click Save button
    const saveButton = screen.getByRole('button', { name: /^save$/i });
    fireEvent.click(saveButton);
    
    // Wait for overwrite dialog
    await waitFor(() => {
      const dialogTitle = screen.getByText(/File Already Exists/i);
      expect(dialogTitle).toBeDefined();
    });
    
    // Click Cancel (get the first cancel button which should be in the overwrite dialog)
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButtons[0]);
    
    // Dialog should close
    await waitFor(() => {
      const dialogTitle = screen.queryByText(/File Already Exists/i);
      expect(dialogTitle).toBeNull();
    });
  });

  it('should download file again when Overwrite is clicked', async () => {
    // Mock sessionStorage to simulate a previously saved file
    sessionStorage.setItem('savedThemeFilenames', JSON.stringify(['test-theme.json']));
    
    // Mock document.createElement to capture link clicks
    const mockClick = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = vi.fn((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        element.click = mockClick;
      }
      return element;
    }) as typeof document.createElement;
    
    const onClose = vi.fn();
    renderThemeEditor({ onClose });
    
    // Set theme name
    const nameInput = screen.getByLabelText(/theme name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Test Theme' } });
    
    // Click Save button
    const saveButton = screen.getByRole('button', { name: /^save$/i });
    fireEvent.click(saveButton);
    
    // Wait for overwrite dialog
    await waitFor(() => {
      const dialogTitle = screen.getByText(/File Already Exists/i);
      expect(dialogTitle).toBeDefined();
    });
    
    // Click Overwrite
    const overwriteButton = screen.getByRole('button', { name: /^Overwrite$/i });
    fireEvent.click(overwriteButton);
    
    // Verify that file download was triggered
    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled();
    });
    
    // Restore original createElement
    document.createElement = originalCreateElement;
  });

  it('should open rename dialog when "Rename" is clicked', async () => {
    // Mock sessionStorage to simulate a previously saved file
    sessionStorage.setItem('savedThemeFilenames', JSON.stringify(['existing-theme.json']));
    
    renderThemeEditor();
    
    // Set theme name
    const nameInput = screen.getByLabelText(/theme name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Existing Theme' } });
    
    // Click Save button
    const saveButton = screen.getByRole('button', { name: /^save$/i });
    fireEvent.click(saveButton);
    
    // Wait for overwrite dialog
    await waitFor(() => {
      const dialogTitle = screen.getByText(/File Already Exists/i);
      expect(dialogTitle).toBeDefined();
    });
    
    // Click "Rename"
    const renameButton = screen.getByRole('button', { name: /^Rename$/i });
    fireEvent.click(renameButton);
    
    // Wait for rename dialog to appear
    await waitFor(() => {
      const renameDialogTitle = screen.getByText(/Save As/i);
      expect(renameDialogTitle).toBeDefined();
    });
  });

  it('should show dialog message about overwriting or saving with different name', async () => {
    // Mock sessionStorage to simulate a previously saved file
    sessionStorage.setItem('savedThemeFilenames', JSON.stringify(['my-theme.json']));
    
    renderThemeEditor();
    
    // Set theme name
    const nameInput = screen.getByLabelText(/theme name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'My Theme' } });
    
    // Click Save button
    const saveButton = screen.getByRole('button', { name: /^save$/i });
    fireEvent.click(saveButton);
    
    // Wait for overwrite dialog
    await waitFor(() => {
      const dialogTitle = screen.getByText(/File Already Exists/i);
      expect(dialogTitle).toBeDefined();
    });
    
    // Verify the dialog message
    const dialogMessage = screen.getByText(/Do you want to overwrite it or save with a different name/i);
    expect(dialogMessage).toBeDefined();
  });

  it('should show message that file was already saved in session', async () => {
    // Mock sessionStorage to simulate a previously saved file
    sessionStorage.setItem('savedThemeFilenames', JSON.stringify(['my-custom-theme.json']));
    
    renderThemeEditor();
    
    // Set theme name
    const nameInput = screen.getByLabelText(/theme name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'My Custom Theme' } });
    
    // Click Save button
    const saveButton = screen.getByRole('button', { name: /^save$/i });
    fireEvent.click(saveButton);
    
    // Wait for overwrite dialog
    await waitFor(() => {
      const dialogTitle = screen.getByText(/File Already Exists/i);
      expect(dialogTitle).toBeDefined();
    });
    
    // Verify the message mentions it was saved in this session
    const sessionMessage = screen.getByText(/This file was already saved in this session/i);
    expect(sessionMessage).toBeDefined();
  });
});
