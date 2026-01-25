import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { I18nProvider } from '../i18n/I18nContext';
import { i18nConfig } from '../i18n/config';

const renderApp = () => {
  return render(
    <I18nProvider config={i18nConfig}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </I18nProvider>
  );
};

describe('Preferences MFE - App Component', () => {
  it('should render preferences title', () => {
    renderApp();
    expect(screen.getByText('Preferences')).toBeDefined();
  });

  it('should render settings icon', () => {
    const { container } = renderApp();
    const icon = container.querySelector('svg[data-testid="SettingsIcon"]');
    expect(icon).toBeDefined();
  });

  it('should render tab navigation', () => {
    renderApp();
    expect(screen.getByText('General')).toBeDefined();
    expect(screen.getByText('Themes')).toBeDefined();
  });

  it('should render general tab by default', () => {
    renderApp();
    const generalTab = screen.getByRole('tab', { name: /general/i });
    expect(generalTab).toBeDefined();
  });

  it('should have proper layout structure', () => {
    const { container } = renderApp();
    const paper = container.querySelector('.MuiPaper-root');
    expect(paper).toBeDefined();
  });

  it('should render tabs component', () => {
    const { container } = renderApp();
    const tabs = container.querySelector('.MuiTabs-root');
    expect(tabs).toBeDefined();
  });
});
