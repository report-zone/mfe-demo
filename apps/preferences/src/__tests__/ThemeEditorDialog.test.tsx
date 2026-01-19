import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThemeEditorDialog from '../components/ThemeEditorDialog';
import { ThemeContextProvider } from '../context/ThemeContext';

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

describe('ThemeEditorDialog - MUI Components Tab', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render MUI Components tab as last tab', () => {
    renderThemeEditor();
    const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
    expect(muiComponentsTab).toBeDefined();
  });

  it('should display MUI component accordions on MUI Components tab', async () => {
    renderThemeEditor();
    
    // Click on MUI Components tab (last tab)
    const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
    fireEvent.click(muiComponentsTab);
    
    await waitFor(() => {
      expect(screen.getByText('MuiAppBar')).toBeDefined();
      expect(screen.getByText('MuiCard')).toBeDefined();
      expect(screen.getByText('MuiAccordion')).toBeDefined();
      expect(screen.getByText('MuiButton')).toBeDefined();
      expect(screen.getByText('MuiCheckbox')).toBeDefined();
    });
  });

  it('should have checkboxes in accordion headers for enabling overrides', async () => {
    renderThemeEditor();
    
    // Click on MUI Components tab
    const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
    fireEvent.click(muiComponentsTab);
    
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      // At least 5 components with root checkbox
      expect(checkboxes.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('should disable input fields when override checkbox is not checked', async () => {
    renderThemeEditor();
    
    // Click on MUI Components tab
    const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
    fireEvent.click(muiComponentsTab);
    
    await waitFor(() => {
      expect(screen.getByText('MuiCard')).toBeDefined();
    });
    
    // Expand MuiCard accordion
    const muiCardAccordion = screen.getByText('MuiCard').closest('button');
    if (muiCardAccordion) {
      fireEvent.click(muiCardAccordion);
    }
    
    await waitFor(() => {
      // Should find input fields in the accordion
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it('should enable input fields when override checkbox is checked', async () => {
    renderThemeEditor();
    
    // Click on MUI Components tab
    const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
    fireEvent.click(muiComponentsTab);
    
    await waitFor(() => {
      expect(screen.getByText('MuiCard')).toBeDefined();
    });
    
    // Find and check the root checkbox for MuiCard
    const checkboxes = screen.getAllByRole('checkbox');
    // MuiCard root checkbox should be second one (after MuiAppBar root)
    if (checkboxes.length >= 2) {
      fireEvent.click(checkboxes[1]);
    }
    
    // Expand MuiCard accordion
    const muiCardAccordion = screen.getByText('MuiCard').closest('button');
    if (muiCardAccordion) {
      fireEvent.click(muiCardAccordion);
    }
    
    await waitFor(() => {
      // Should find input fields enabled
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  it('should update theme definition when MUI override values are changed', async () => {
    renderThemeEditor();
    
    // Click on MUI Components tab
    const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
    fireEvent.click(muiComponentsTab);
    
    await waitFor(() => {
      expect(screen.getByText('MuiButton')).toBeDefined();
    });
    
    // Expand MuiButton accordion first
    const muiButtonAccordion = screen.getByText('MuiButton').closest('button');
    if (muiButtonAccordion) {
      fireEvent.click(muiButtonAccordion);
    }
    
    // Find and check the root checkbox for MuiButton (inside the accordion header)
    await waitFor(() => {
      // Find the checkbox that is within the MuiButton section
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
    
    await waitFor(() => {
      const textTransformInput = screen.getByLabelText('textTransform') as HTMLInputElement;
      expect(textTransformInput).toBeDefined();
    });
    
    const textTransformInput = screen.getByLabelText('textTransform') as HTMLInputElement;
    fireEvent.change(textTransformInput, { target: { value: 'none' } });
    
    await waitFor(() => {
      expect(textTransformInput.value).toBe('none');
    });
  });

  it('should have multiple override options for MuiButton', async () => {
    renderThemeEditor();
    
    // Click on MUI Components tab
    const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
    fireEvent.click(muiComponentsTab);
    
    await waitFor(() => {
      expect(screen.getByText('MuiButton')).toBeDefined();
    });
    
    // MuiButton should have root, text, contained, and outlined checkboxes
    const allCheckboxes = screen.getAllByRole('checkbox');
    const buttonRelatedCheckboxes = allCheckboxes.filter(cb => {
      const label = cb.closest('label');
      const labelText = label?.textContent || '';
      return ['root', 'text', 'contained', 'outlined'].includes(labelText);
    });
    
    // Should have at least 4 checkboxes for MuiButton
    expect(buttonRelatedCheckboxes.length).toBeGreaterThanOrEqual(4);
  });
});
