import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('Admin MFE - App Component', () => {
  it('should render admin panel title', () => {
    render(<App />);
    expect(screen.getByText('Admin Panel')).toBeDefined();
  });

  it('should render admin warning message', () => {
    render(<App />);
    expect(screen.getByText(/protected admin area/i)).toBeDefined();
  });

  it('should render admin icon', () => {
    const { container } = render(<App />);
    const icon = container.querySelector('svg[data-testid="AdminPanelSettingsIcon"]');
    expect(icon).toBeDefined();
  });

  it('should render users table', () => {
    render(<App />);
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Email')).toBeDefined();
    expect(screen.getByText('Role')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
  });

  it('should render user data in table', () => {
    render(<App />);
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('john@example.com')).toBeDefined();
    expect(screen.getByText('Jane Smith')).toBeDefined();
    expect(screen.getByText('jane@example.com')).toBeDefined();
    expect(screen.getByText('Bob Johnson')).toBeDefined();
    expect(screen.getByText('bob@example.com')).toBeDefined();
  });

  it('should render role chips', () => {
    const { container } = render(<App />);
    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBeGreaterThan(0);
  });

  it('should render active status for users', () => {
    render(<App />);
    const activeStatuses = screen.getAllByText('Active');
    expect(activeStatuses.length).toBeGreaterThan(0);
  });

  it('should render inactive status for users', () => {
    render(<App />);
    expect(screen.getByText('Inactive')).toBeDefined();
  });

  it('should render warning alert', () => {
    const { container } = render(<App />);
    const alert = container.querySelector('.MuiAlert-standardWarning');
    expect(alert).toBeDefined();
  });

  it('should have table structure', () => {
    const { container } = render(<App />);
    const table = container.querySelector('table');
    expect(table).toBeDefined();
  });
});
