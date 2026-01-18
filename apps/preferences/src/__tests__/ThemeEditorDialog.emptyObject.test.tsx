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

describe('ThemeEditorDialog - Empty Object Editing Fix', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should allow editing empty objects in Monaco editor', async () => {
    renderThemeEditor();
    
    // Navigate to Full Theme JSON tab
    const fullThemeTab = screen.getByRole('tab', { name: /full theme json/i });
    fireEvent.click(fullThemeTab);
    
    await waitFor(() => {
      const monacoEditor = screen.getByTestId('monaco-editor');
      expect(monacoEditor).toBeDefined();
    });
    
    const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
    
    // Get the current JSON
    const currentJson = JSON.parse(monacoEditor.value);
    
    // Add an empty object for MuiAccordion
    const updatedJson = {
      ...currentJson,
      muiComponentOverrides: {
        MuiAccordion: {},
      },
    };
    
    // Set the JSON with empty object
    fireEvent.change(monacoEditor, { 
      target: { value: JSON.stringify(updatedJson, null, 2) } 
    });
    
    // Wait for debounce to complete
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Now verify the value is still there (not reset)
    const afterDebounceValue = monacoEditor.value;
    expect(afterDebounceValue).toContain('"MuiAccordion": {}');
    
    // Simulate typing inside the empty object
    const jsonWithProperty = JSON.parse(afterDebounceValue);
    jsonWithProperty.muiComponentOverrides.MuiAccordion = {
      styleOverrides: {
        root: {
          borderRadius: 4
        }
      }
    };
    
    // Type the new property
    fireEvent.change(monacoEditor, {
      target: { value: JSON.stringify(jsonWithProperty, null, 2) }
    });
    
    // Immediately check the value (before debounce) - it should not reset
    expect(monacoEditor.value).toContain('"borderRadius": 4');
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // After debounce, the value should still be there
    await waitFor(() => {
      expect(monacoEditor.value).toContain('"MuiAccordion"');
      expect(monacoEditor.value).toContain('"borderRadius": 4');
    });
  });

  it('should preserve editor content during typing (isTypingInJsonEditor flag)', async () => {
    renderThemeEditor();
    
    // Navigate to Full Theme JSON tab
    const fullThemeTab = screen.getByRole('tab', { name: /full theme json/i });
    fireEvent.click(fullThemeTab);
    
    await waitFor(() => {
      const monacoEditor = screen.getByTestId('monaco-editor');
      expect(monacoEditor).toBeDefined();
    });
    
    const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
    
    // Start typing invalid JSON (simulating user typing inside empty object)
    const invalidJson = '{ "MuiAccordion": { "styleOverrides": {';
    fireEvent.change(monacoEditor, { target: { value: invalidJson } });
    
    // The value should not be reset immediately (stays as typed even if invalid)
    expect(monacoEditor.value).toBe(invalidJson);
    
    // Wait a bit (but less than debounce time)
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Value should still be preserved
    expect(monacoEditor.value).toBe(invalidJson);
  });

  it('should update themeDefinition after valid JSON and debounce completes', async () => {
    renderThemeEditor();
    
    // Navigate to Full Theme JSON tab
    const fullThemeTab = screen.getByRole('tab', { name: /full theme json/i });
    fireEvent.click(fullThemeTab);
    
    await waitFor(() => {
      const monacoEditor = screen.getByTestId('monaco-editor');
      expect(monacoEditor).toBeDefined();
    });
    
    const monacoEditor = screen.getByTestId('monaco-editor') as HTMLTextAreaElement;
    const initialValue = monacoEditor.value;
    const currentJson = JSON.parse(initialValue);
    
    // Update with valid JSON
    const updatedJson = {
      ...currentJson,
      name: 'Test Theme After Debounce',
    };
    
    fireEvent.change(monacoEditor, {
      target: { value: JSON.stringify(updatedJson, null, 2) }
    });
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Navigate to another tab to verify state was updated
    const primaryTab = screen.getByRole('tab', { name: /^primary$/i });
    fireEvent.click(primaryTab);
    
    // Wait for tab change
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/theme name/i) as HTMLInputElement;
      expect(nameInput).toBeDefined();
    });
    
    const nameInput = screen.getByLabelText(/theme name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Test Theme After Debounce');
  });
});
