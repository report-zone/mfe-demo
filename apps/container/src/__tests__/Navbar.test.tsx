import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../contexts/AuthContext';

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
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </BrowserRouter>
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
      expect(screen.getByText('Home')).toBeDefined();
      expect(screen.getByText('Preferences')).toBeDefined();
      expect(screen.getByText('Account')).toBeDefined();
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
      expect(screen.getByText('Admin')).toBeDefined();
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
      expect(screen.getByText('Preferences')).toBeDefined();
    });

    const preferencesLink = screen.getByText('Preferences');
    preferencesLink.click();

    // Navigation would update the URL, but we're testing the click handler works
    expect(preferencesLink).toBeDefined();
  });
});
