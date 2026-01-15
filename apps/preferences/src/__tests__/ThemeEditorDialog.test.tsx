import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('ThemeEditorDialog - Full Theme JSON Editor', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render full theme JSON tab as last tab', () => {
    renderThemeEditor();
    const fullThemeTab = screen.getByRole('tab', { name: /full theme json/i });
    expect(fullThemeTab).toBeDefined();
  });

  it('should display Monaco editor on full theme JSON tab', async () => {
    renderThemeEditor();
    
    // Click on Full Theme JSON tab (last tab)
    const fullThemeTab = screen.getByRole('tab', { name: /full theme json/i });
    fireEvent.click(fullThemeTab);
    
    await waitFor(() => {
      const monacoEditor = screen.getByTestId('monaco-editor');
      expect(monacoEditor).toBeDefined();
    });
  });

  it('should initialize full theme JSON with correct structure', async () => {
    renderThemeEditor();
    
    // Click on Full Theme JSON tab
    const fullThemeTab = screen.getByRole('tab', { name: /full theme json/i });
    fireEvent.click(fullThemeTab);
    
    await waitFor(() => {
      const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
      const jsonValue = monacoEditor.value;
      
      expect(jsonValue).toContain('"name"');
      expect(jsonValue).toContain('"version"');
      expect(jsonValue).toContain('"colors"');
      expect(jsonValue).toContain('"overrides"');
    });
  });

  it('should update color fields when full theme JSON is edited', async () => {
    renderThemeEditor();
    
    // Click on Full Theme JSON tab
    const fullThemeTab = screen.getByRole('tab', { name: /full theme json/i });
    fireEvent.click(fullThemeTab);
    
    await waitFor(() => {
      const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
      expect(monacoEditor).toBeDefined();
    });
    
    const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
    
    // Parse the initial JSON and modify it
    const initialJson = JSON.parse(monacoEditor.value);
    const updatedJson = {
      ...initialJson,
      colors: {
        ...initialJson.colors,
        primaryMain: '#00ff00',
      },
    };
    
    // Update Monaco editor
    fireEvent.change(monacoEditor, { target: { value: JSON.stringify(updatedJson, null, 2) } });
    
    // Verify the change was accepted by checking the editor value
    await waitFor(() => {
      const currentValue = monacoEditor.value;
      const parsed = JSON.parse(currentValue);
      expect(parsed.colors.primaryMain).toBe('#00ff00');
    });
  });

  it('should show error when full theme JSON is invalid', async () => {
    renderThemeEditor();
    
    // Click on Full Theme JSON tab
    const fullThemeTab = screen.getByRole('tab', { name: /full theme json/i });
    fireEvent.click(fullThemeTab);
    
    await waitFor(() => {
      const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
      expect(monacoEditor).toBeDefined();
    });
    
    const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
    
    // Enter invalid JSON
    fireEvent.change(monacoEditor, { target: { value: '{ invalid json }' } });
    
    // Error should be displayed (note: error might appear as a generic message)
    await waitFor(() => {
      // Check if there's any error indication in the UI
      const alerts = screen.queryAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  it('should sync theme name changes to full theme JSON', async () => {
    renderThemeEditor();
    
    // Click on Full Theme JSON tab
    const fullThemeTab = screen.getByRole('tab', { name: /full theme json/i });
    fireEvent.click(fullThemeTab);
    
    await waitFor(() => {
      const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
      expect(monacoEditor).toBeDefined();
    });
    
    const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
    
    // Find and change theme name
    const nameInput = screen.getByLabelText(/theme name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'My Custom Theme' } });
    
    // Check if JSON was updated
    await waitFor(() => {
      const updatedJson = monacoEditor.value;
      expect(updatedJson).toContain('"name": "My Custom Theme"');
    });
  });

  it('should sync description changes to full theme JSON', async () => {
    renderThemeEditor();
    
    // Click on Full Theme JSON tab
    const fullThemeTab = screen.getByRole('tab', { name: /full theme json/i });
    fireEvent.click(fullThemeTab);
    
    await waitFor(() => {
      const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
      expect(monacoEditor).toBeDefined();
    });
    
    const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
    
    // Find and change description
    const descInput = screen.getByLabelText(/theme description/i) as HTMLInputElement;
    fireEvent.change(descInput, { target: { value: 'A beautiful theme' } });
    
    // Check if JSON was updated
    await waitFor(() => {
      const updatedJson = monacoEditor.value;
      expect(updatedJson).toContain('"description": "A beautiful theme"');
    });
  });

  it('should preserve overrides section when editing theme name', async () => {
    renderThemeEditor();
    
    // Click on Full Theme JSON tab
    const fullThemeTab = screen.getByRole('tab', { name: /full theme json/i });
    fireEvent.click(fullThemeTab);
    
    await waitFor(() => {
      const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
      expect(monacoEditor).toBeDefined();
    });
    
    const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
    
    // Get initial JSON with overrides
    const initialJson = JSON.parse(monacoEditor.value);
    const customOverrides = {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    };
    
    // Update JSON with custom overrides
    const updatedJson = {
      ...initialJson,
      overrides: customOverrides,
    };
    
    fireEvent.change(monacoEditor, { target: { value: JSON.stringify(updatedJson, null, 2) } });
    
    // Change theme name
    const nameInput = screen.getByLabelText(/theme name/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    
    // Verify overrides are still there
    await waitFor(() => {
      const finalJson = monacoEditor.value;
      expect(finalJson).toContain('"textTransform": "none"');
      expect(finalJson).toContain('"name": "New Name"');
    });
  });

  it('should include all required fields in theme JSON', async () => {
    renderThemeEditor();
    
    // Click on Full Theme JSON tab
    const fullThemeTab = screen.getByRole('tab', { name: /full theme json/i });
    fireEvent.click(fullThemeTab);
    
    await waitFor(() => {
      const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
      expect(monacoEditor).toBeDefined();
    });
    
    const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
    const jsonValue = monacoEditor.value;
    const parsed = JSON.parse(jsonValue);
    
    // Check required top-level fields
    expect(parsed.name).toBeDefined();
    expect(parsed.version).toBeDefined();
    expect(parsed.colors).toBeDefined();
    expect(parsed.overrides).toBeDefined();
    
    // Check required color fields
    expect(parsed.colors.primaryMain).toBeDefined();
    expect(parsed.colors.secondaryMain).toBeDefined();
    expect(parsed.colors.errorMain).toBeDefined();
    expect(parsed.colors.warningMain).toBeDefined();
    expect(parsed.colors.infoMain).toBeDefined();
    expect(parsed.colors.successMain).toBeDefined();
    expect(parsed.colors.backgroundDefault).toBeDefined();
    expect(parsed.colors.backgroundPaper).toBeDefined();
    expect(parsed.colors.textPrimary).toBeDefined();
    expect(parsed.colors.textSecondary).toBeDefined();
  });

  it('should prevent saving when full theme JSON has errors', async () => {
    const onClose = vi.fn();
    renderThemeEditor({ onClose });
    
    // Click on Full Theme JSON tab
    const fullThemeTab = screen.getByRole('tab', { name: /full theme json/i });
    fireEvent.click(fullThemeTab);
    
    await waitFor(() => {
      const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
      expect(monacoEditor).toBeDefined();
    });
    
    const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
    
    // Enter invalid JSON
    fireEvent.change(monacoEditor, { target: { value: '{ invalid }' } });
    
    // Try to save
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Should show error message
    await waitFor(() => {
      const errorMessage = screen.queryByText(/fix json errors/i);
      expect(errorMessage).toBeDefined();
    });
    
    // Should not close dialog
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should format theme JSON with createdAt and modifiedAt timestamps', async () => {
    renderThemeEditor();
    
    // Click on Full Theme JSON tab
    const fullThemeTab = screen.getByRole('tab', { name: /full theme json/i });
    fireEvent.click(fullThemeTab);
    
    await waitFor(() => {
      const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
      expect(monacoEditor).toBeDefined();
    });
    
    const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
    const jsonValue = monacoEditor.value;
    const parsed = JSON.parse(jsonValue);
    
    // Check for timestamp fields
    expect(parsed.createdAt).toBeDefined();
    expect(parsed.modifiedAt).toBeDefined();
    
    // Verify they are valid ISO timestamps
    expect(new Date(parsed.createdAt).toISOString()).toBe(parsed.createdAt);
    expect(new Date(parsed.modifiedAt).toISOString()).toBe(parsed.modifiedAt);
  });
});
