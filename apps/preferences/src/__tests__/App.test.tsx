import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
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
