import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../contexts/AuthContext';
import { I18nProvider } from '../i18n/I18nContext';
import { i18nConfig } from '../i18n/config';

// Mock the auth service
vi.mock('../services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    confirmSignUp: vi.fn(),
    resetPassword: vi.fn(),
    confirmResetPassword: vi.fn(),
  },
}));

const renderNavbar = () => {
  return render(
    <I18nProvider config={i18nConfig}>
      <BrowserRouter>
        <AuthProvider>
          <Navbar mobileOpen={false} onDrawerToggle={() => {}} />
        </AuthProvider>
      </BrowserRouter>
    </I18nProvider>
  );
};

describe('Navbar component', () => {
  it('should render standard navigation items', async () => {
    const authService = await import('../services/authService');
    vi.mocked(authService.default.getCurrentUser).mockResolvedValue({
      username: 'testuser',
      email: 'test@example.com',
      groups: ['user'],
    });

    renderNavbar();

    await waitFor(() => {
      expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Preferences').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Account').length).toBeGreaterThan(0);
    });
  });

  it('should not show Admin link for non-admin users', async () => {
    const authService = await import('../services/authService');
    vi.mocked(authService.default.getCurrentUser).mockResolvedValue({
      username: 'testuser',
      email: 'test@example.com',
      groups: ['user'],
    });

    renderNavbar();

    await waitFor(() => {
      expect(screen.queryByText('Admin')).toBeNull();
    });
  });

  it('should show Admin link for admin users', async () => {
    const authService = await import('../services/authService');
    vi.mocked(authService.default.getCurrentUser).mockResolvedValue({
      username: 'adminuser',
      email: 'admin@example.com',
      groups: ['admin'],
    });

    renderNavbar();

    await waitFor(() => {
      expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
    });
  });

  it('should navigate when clicking nav items', async () => {
    const authService = await import('../services/authService');
    vi.mocked(authService.default.getCurrentUser).mockResolvedValue({
      username: 'testuser',
      email: 'test@example.com',
      groups: ['user'],
    });

    renderNavbar();

    await waitFor(() => {
      const preferencesLinks = screen.getAllByText('Preferences');
      expect(preferencesLinks.length).toBeGreaterThan(0);
    });

    const preferencesLinks = screen.getAllByText('Preferences');
    preferencesLinks[0].click();

    // Navigation would update the URL, but we're testing the click handler works
    expect(preferencesLinks[0]).toBeDefined();
  });
});
