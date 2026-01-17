import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThemeEditorDialog from '../components/ThemeEditorDialog';
import { ThemeContextProvider } from '../context/ThemeContext';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value: string; onChange: (val: string | undefined) => void }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// Mock URL.createObjectURL which is not available in jsdom
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

const renderThemeEditor = (props = {}) => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
  };

  return render(
    <ThemeContextProvider>
      <ThemeEditorDialog {...defaultProps} {...props} />
    </ThemeContextProvider>
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
      const overwriteDialog = screen.queryByText(/Replace Existing File/i);
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
      const dialogTitle = screen.getByText(/Replace Existing File/i);
      expect(dialogTitle).toBeDefined();
    });
    
    // Verify the dialog content mentions the filename
    const dialogContent = screen.getByText(/my-new-theme\.json/i);
    expect(dialogContent).toBeDefined();
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
      const dialogTitle = screen.getByText(/Replace Existing File/i);
      expect(dialogTitle).toBeDefined();
    });
    
    // Verify button labels - the button should say "Replace" not "Download Again"
    const replaceButton = screen.getByRole('button', { name: /^Replace$/i });
    expect(replaceButton).toBeDefined();
    
    const saveAsDifferentButton = screen.getByRole('button', { name: /Save As Different Name/i });
    expect(saveAsDifferentButton).toBeDefined();
    
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
      const dialogTitle = screen.getByText(/Replace Existing File/i);
      expect(dialogTitle).toBeDefined();
    });
    
    // Click Cancel (get the first cancel button which should be in the overwrite dialog)
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButtons[0]);
    
    // Dialog should close
    await waitFor(() => {
      const dialogTitle = screen.queryByText(/Replace Existing File/i);
      expect(dialogTitle).toBeNull();
    });
  });

  it('should download file again when Replace is clicked', async () => {
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
      const dialogTitle = screen.getByText(/Replace Existing File/i);
      expect(dialogTitle).toBeDefined();
    });
    
    // Click Replace
    const replaceButton = screen.getByRole('button', { name: /^Replace$/i });
    fireEvent.click(replaceButton);
    
    // Verify that file download was triggered
    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled();
    });
    
    // Restore original createElement
    document.createElement = originalCreateElement;
  });

  it('should open rename dialog when "Save As Different Name" is clicked', async () => {
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
      const dialogTitle = screen.getByText(/Replace Existing File/i);
      expect(dialogTitle).toBeDefined();
    });
    
    // Click "Save As Different Name"
    const saveAsDifferentButton = screen.getByRole('button', { name: /Save As Different Name/i });
    fireEvent.click(saveAsDifferentButton);
    
    // Wait for rename dialog to appear
    await waitFor(() => {
      const renameDialogTitle = screen.getByText(/Save As Different Filename/i);
      expect(renameDialogTitle).toBeDefined();
    });
  });

  it('should include browser limitation note in dialog', async () => {
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
      const dialogTitle = screen.getByText(/Replace Existing File/i);
      expect(dialogTitle).toBeDefined();
    });
    
    // Verify browser limitation note is present
    const note = screen.getByText(/Due to browser limitations/i);
    expect(note).toBeDefined();
    
    // Verify mention of automatic renaming
    const autoRename = screen.getByText(/theme \(1\)\.json/i);
    expect(autoRename).toBeDefined();
  });

  it('should show appropriate message asking to replace file', async () => {
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
      const dialogTitle = screen.getByText(/Replace Existing File/i);
      expect(dialogTitle).toBeDefined();
    });
    
    // Verify the message asks about replacing
    const replaceMessage = screen.getByText(/Do you want to replace it with the new version/i);
    expect(replaceMessage).toBeDefined();
  });
});
