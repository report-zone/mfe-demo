import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThemeEditorDialog from '../components/ThemeEditorDialog';
import { ThemeContextProvider } from '../context/ThemeContext';
import { I18nProvider } from '../i18n/I18nContext';
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

describe('ThemeEditorDialog - Accordion Expand Behavior', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should allow accordion interaction even when no checkboxes are selected', async () => {
    renderThemeEditor();
    
    // Navigate to MUI Components tab
    const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
    fireEvent.click(muiComponentsTab);
    
    await waitFor(() => {
      expect(screen.getByText('MuiAppBar')).toBeDefined();
    });

    // Find the MuiAppBar accordion
    const muiAppBarAccordion = screen.getByText('MuiAppBar').closest('.MuiAccordion-root');
    expect(muiAppBarAccordion).toBeDefined();
    
    // The accordion should NOT be disabled (users need to be able to click checkboxes)
    if (muiAppBarAccordion) {
      const accordionElement = muiAppBarAccordion as HTMLElement;
      // The Accordion should not have the Mui-disabled class
      expect(accordionElement.classList.contains('Mui-disabled')).toBe(false);
    }
  });

  it('should allow accordion interaction when a checkbox is selected', async () => {
    renderThemeEditor();
    
    // Navigate to MUI Components tab
    const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
    fireEvent.click(muiComponentsTab);
    
    await waitFor(() => {
      expect(screen.getByText('MuiCard')).toBeDefined();
    });

    // Find the MuiCard accordion
    const muiCardAccordion = screen.getByText('MuiCard').closest('.MuiAccordion-root');
    expect(muiCardAccordion).toBeDefined();

    // Should not be disabled
    if (muiCardAccordion) {
      expect((muiCardAccordion as HTMLElement).classList.contains('Mui-disabled')).toBe(false);
    }

    // Find and check the root checkbox for MuiCard
    const muiCardSection = screen.getByText('MuiCard').closest('.MuiAccordion-root');
    if (muiCardSection) {
      const checkboxes = muiCardSection.querySelectorAll('input[type="checkbox"]');
      const rootCheckbox = Array.from(checkboxes).find((cb) => {
        const label = cb.closest('label');
        return label?.textContent === 'root';
      }) as HTMLInputElement;
      
      expect(rootCheckbox).toBeDefined();
      
      // Check the checkbox
      fireEvent.click(rootCheckbox);
      
      await waitFor(() => {
        // After checking, accordion should still not be disabled
        expect((muiCardAccordion as HTMLElement).classList.contains('Mui-disabled')).toBe(false);
      });
    }
  });

  it('should collapse accordion when last checkbox is unchecked', async () => {
    renderThemeEditor();
    
    // Navigate to MUI Components tab
    const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
    fireEvent.click(muiComponentsTab);
    
    await waitFor(() => {
      expect(screen.getByText('MuiAccordion')).toBeDefined();
    });

    // Find the MuiAccordion accordion section
    const muiAccordionSection = screen.getByText('MuiAccordion').closest('.MuiAccordion-root');
    expect(muiAccordionSection).toBeDefined();

    if (muiAccordionSection) {
      // Find and check the root checkbox
      const checkboxes = muiAccordionSection.querySelectorAll('input[type="checkbox"]');
      const rootCheckbox = Array.from(checkboxes).find((cb) => {
        const label = cb.closest('label');
        return label?.textContent === 'root';
      }) as HTMLInputElement;
      
      expect(rootCheckbox).toBeDefined();
      
      // Check the checkbox
      fireEvent.click(rootCheckbox);
      
      await waitFor(() => {
        expect((muiAccordionSection as HTMLElement).classList.contains('Mui-disabled')).toBe(false);
      });
      
      // Expand the accordion
      const accordionSummary = muiAccordionSection.querySelector('.MuiAccordionSummary-root') as HTMLElement;
      fireEvent.click(accordionSummary);
      
      await waitFor(() => {
        // Check that accordion is expanded by looking for expanded class
        expect((muiAccordionSection as HTMLElement).classList.contains('Mui-expanded')).toBe(true);
      });
      
      // Now uncheck the checkbox
      fireEvent.click(rootCheckbox);
      
      await waitFor(() => {
        // Accordion should be collapsed (not expanded)
        expect((muiAccordionSection as HTMLElement).classList.contains('Mui-expanded')).toBe(false);
        // But should NOT be disabled anymore
        expect((muiAccordionSection as HTMLElement).classList.contains('Mui-disabled')).toBe(false);
      });
    }
  });

  it('should not collapse accordion when unchecking one checkbox if others remain checked', async () => {
    renderThemeEditor();
    
    // Navigate to MUI Components tab
    const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
    fireEvent.click(muiComponentsTab);
    
    await waitFor(() => {
      expect(screen.getByText('MuiButton')).toBeDefined();
    });

    // Find the MuiButton section (it has multiple checkboxes)
    const muiButtonSection = screen.getByText('MuiButton').closest('.MuiAccordion-root');
    expect(muiButtonSection).toBeDefined();

    if (muiButtonSection) {
      // Find checkboxes for root and text
      const checkboxes = muiButtonSection.querySelectorAll('input[type="checkbox"]');
      const rootCheckbox = Array.from(checkboxes).find((cb) => {
        const label = cb.closest('label');
        return label?.textContent === 'root';
      }) as HTMLInputElement;
      
      const textCheckbox = Array.from(checkboxes).find((cb) => {
        const label = cb.closest('label');
        return label?.textContent === 'text';
      }) as HTMLInputElement;
      
      expect(rootCheckbox).toBeDefined();
      expect(textCheckbox).toBeDefined();
      
      // Check both checkboxes
      fireEvent.click(rootCheckbox);
      fireEvent.click(textCheckbox);
      
      await waitFor(() => {
        expect((muiButtonSection as HTMLElement).classList.contains('Mui-disabled')).toBe(false);
      });
      
      // Expand the accordion
      const accordionSummary = muiButtonSection.querySelector('.MuiAccordionSummary-root') as HTMLElement;
      fireEvent.click(accordionSummary);
      
      await waitFor(() => {
        expect((muiButtonSection as HTMLElement).classList.contains('Mui-expanded')).toBe(true);
      });
      
      // Uncheck one checkbox (root)
      fireEvent.click(rootCheckbox);
      
      // Wait a bit to ensure no collapse happens
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Accordion should still be expanded because text checkbox is still checked
      expect((muiButtonSection as HTMLElement).classList.contains('Mui-expanded')).toBe(true);
      expect((muiButtonSection as HTMLElement).classList.contains('Mui-disabled')).toBe(false);
    }
  });

  it('should keep accordion collapsed after dialog reopen if no checkboxes selected', async () => {
    const onClose = vi.fn();
    const { rerender } = renderThemeEditor({ onClose });
    
    // Navigate to MUI Components tab
    const muiComponentsTab = screen.getByRole('tab', { name: /mui components/i });
    fireEvent.click(muiComponentsTab);
    
    await waitFor(() => {
      expect(screen.getByText('MuiCheckbox')).toBeDefined();
    });

    // Close dialog
    rerender(
      <I18nProvider config={i18nConfig}>
        <ThemeContextProvider>
          <ThemeEditorDialog open={false} onClose={onClose} />
        </ThemeContextProvider>
      </I18nProvider>
    );
    
    // Reopen dialog
    rerender(
      <I18nProvider config={i18nConfig}>
        <ThemeContextProvider>
          <ThemeEditorDialog open={true} onClose={onClose} />
        </ThemeContextProvider>
      </I18nProvider>
    );
    
    // Navigate to MUI Components tab again
    const muiComponentsTabAgain = screen.getByRole('tab', { name: /mui components/i });
    fireEvent.click(muiComponentsTabAgain);
    
    await waitFor(() => {
      expect(screen.getByText('MuiCheckbox')).toBeDefined();
    });
    
    // All accordions should be collapsed but NOT disabled
    const muiCheckboxAccordion = screen.getByText('MuiCheckbox').closest('.MuiAccordion-root');
    if (muiCheckboxAccordion) {
      expect((muiCheckboxAccordion as HTMLElement).classList.contains('Mui-disabled')).toBe(false);
      expect((muiCheckboxAccordion as HTMLElement).classList.contains('Mui-expanded')).toBe(false);
    }
  });
});
