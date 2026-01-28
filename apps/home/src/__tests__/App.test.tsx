import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { I18nProvider } from '@mfe-demo/shared-hooks';
import { i18nConfig } from '../i18n/config';

const renderWithI18n = (component: React.ReactElement) => {
  return render(<I18nProvider config={i18nConfig}>{component}</I18nProvider>);
};

describe('Home MFE - App Component', () => {
  it('should render home title', () => {
    renderWithI18n(<App />);
    expect(screen.getByText('Home')).toBeDefined();
  });

  it('should render welcome message', () => {
    renderWithI18n(<App />);
    expect(screen.getByText(/Welcome to the Home micro frontend application/i)).toBeDefined();
  });

  it('should render dashboard card', () => {
    renderWithI18n(<App />);
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText(/View your personalized dashboard/i)).toBeDefined();
  });

  it('should render recent activity card', () => {
    renderWithI18n(<App />);
    expect(screen.getByText('Recent Activity')).toBeDefined();
    expect(screen.getByText(/Stay up to date with your recent activities/i)).toBeDefined();
  });

  it('should render quick actions card', () => {
    renderWithI18n(<App />);
    expect(screen.getByText('Quick Actions')).toBeDefined();
    expect(screen.getByText(/Access frequently used features/i)).toBeDefined();
  });

  it('should render home icon', () => {
    const { container } = renderWithI18n(<App />);
    const icon = container.querySelector('svg[data-testid="HomeIcon"]');
    expect(icon).toBeDefined();
  });

  it('should have proper layout structure', () => {
    const { container } = renderWithI18n(<App />);
    const paper = container.querySelector('.MuiPaper-root');
    expect(paper).toBeDefined();
  });
});

