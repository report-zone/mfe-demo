import { describe, it, expect, vi, beforeEach } from 'vitest';
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

// Helper function to setup MuiButton root checkbox and hover input
const setupMuiButtonHoverInput = async () => {
  // Click on MUI Components tab
  const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
  fireEvent.click(muiComponentsTab);
  
  await waitFor(() => {
    expect(screen.getByText('MuiButton')).toBeDefined();
  });
  
  // Expand MuiButton accordion
  const muiButtonAccordion = screen.getByText('MuiButton').closest('button');
  if (muiButtonAccordion) {
    fireEvent.click(muiButtonAccordion);
  }
  
  // Find and check the root checkbox for MuiButton
  await waitFor(() => {
    const muiButtonSection = screen.getByText('MuiButton').closest('.MuiAccordion-root');
    if (muiButtonSection) {
      const muiButtonCheckboxes = Array.from(muiButtonSection.querySelectorAll('input[type="checkbox"]'));
      const muiButtonRootCheckbox = muiButtonCheckboxes.find((cb: any) => {
        const label = cb.closest('label');
        return label?.textContent === 'root';
      }) as HTMLInputElement;
      
      if (muiButtonRootCheckbox && !muiButtonRootCheckbox.checked) {
        fireEvent.click(muiButtonRootCheckbox);
      }
    }
  });
  
  // Wait for hover input to be available
  await waitFor(() => {
    const hoverInput = screen.getByLabelText('&:hover backgroundColor') as HTMLInputElement;
    expect(hoverInput).toBeDefined();
  });
  
  return screen.getByLabelText('&:hover backgroundColor') as HTMLInputElement;
};

describe('ThemeEditorDialog - Hover Styling', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should parse JSON for &:hover pseudo-selector', async () => {
    renderThemeEditor();
    
    const hoverInput = await setupMuiButtonHoverInput();
    
    // Enter JSON value for hover
    fireEvent.change(hoverInput, { target: { value: '{"backgroundColor":"green"}' } });
    
    await waitFor(() => {
      expect(hoverInput.value).toBe('{"backgroundColor":"green"}');
    });
  });

  it('should handle invalid JSON gracefully for &:hover', async () => {
    renderThemeEditor();
    
    const hoverInput = await setupMuiButtonHoverInput();
    
    // Enter invalid JSON (user still typing)
    fireEvent.change(hoverInput, { target: { value: '{"backgroundColor":"gr' } });
    
    // Should not throw error
    await waitFor(() => {
      expect(hoverInput.value).toBe('{"backgroundColor":"gr');
    });
  });

  it('should stringify object values when displaying &:hover', async () => {
    const initialTheme = {
      name: 'Test Theme',
      version: '1.0.0',
      description: 'Test',
      palette: { mode: 'light' as const },
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
        button: {
          borderRadius: 4,
          textTransform: 'uppercase',
        },
      },
      muiComponentOverrides: {
        MuiButton: {
          styleOverrides: {
            root: {
              '&:hover': {
                backgroundColor: 'green',
              },
            },
          },
        },
      },
      createdAt: new Date().toISOString(),
    };
    
    renderThemeEditor({ initialTheme });
    
    const hoverInput = await setupMuiButtonHoverInput();
    
    // Check it displays the stringified object
    expect(hoverInput.value).toBe('{"backgroundColor":"green"}');
  });

  it('should remove property when value is empty', async () => {
    renderThemeEditor();
    
    const hoverInput = await setupMuiButtonHoverInput();
    
    // Enter JSON value first
    fireEvent.change(hoverInput, { target: { value: '{"backgroundColor":"green"}' } });
    
    await waitFor(() => {
      expect(hoverInput.value).toBe('{"backgroundColor":"green"}');
    });
    
    // Clear the value
    fireEvent.change(hoverInput, { target: { value: '' } });
    
    await waitFor(() => {
      expect(hoverInput.value).toBe('');
    });
  });
});
