import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { I18nProvider } from '../i18n/I18nContext';
import { i18nConfig } from '../i18n/config';

const renderApp = () => {
  return render(
    <I18nProvider config={i18nConfig}>
      <App />
    </I18nProvider>
  );
};

describe('Admin MFE - App Component', () => {
  it('should render admin panel title', () => {
    renderApp();
    expect(screen.getByText('Admin Panel')).toBeDefined();
  });

  it('should render admin warning message', () => {
    renderApp();
    expect(screen.getByText(/protected admin area/i)).toBeDefined();
  });

  it('should render admin icon', () => {
    const { container } = renderApp();
    const icon = container.querySelector('svg[data-testid="AdminPanelSettingsIcon"]');
    expect(icon).toBeDefined();
  });

  it('should render users table', () => {
    renderApp();
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Email')).toBeDefined();
    expect(screen.getByText('Role')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
  });

  it('should render user data in table', () => {
    renderApp();
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('john@example.com')).toBeDefined();
    expect(screen.getByText('Jane Smith')).toBeDefined();
    expect(screen.getByText('jane@example.com')).toBeDefined();
    expect(screen.getByText('Bob Johnson')).toBeDefined();
    expect(screen.getByText('bob@example.com')).toBeDefined();
  });

  it('should render role chips', () => {
    const { container } = renderApp();
    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBeGreaterThan(0);
  });

  it('should render active status for users', () => {
    renderApp();
    const activeStatuses = screen.getAllByText('Active');
    expect(activeStatuses.length).toBeGreaterThan(0);
  });

  it('should render inactive status for users', () => {
    renderApp();
    expect(screen.getByText('Inactive')).toBeDefined();
  });

  it('should render warning alert', () => {
    const { container } = renderApp();
    const alert = container.querySelector('.MuiAlert-standardWarning');
    expect(alert).toBeDefined();
  });

  it('should have table structure', () => {
    const { container } = renderApp();
    const table = container.querySelector('table');
    expect(table).toBeDefined();
  });
});
