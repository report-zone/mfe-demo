import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../components/Header';
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

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Header />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Header component', () => {
  it('should render app title', async () => {
    const authService = await import('../services/authService');
    vi.mocked(authService.default.getCurrentUser).mockResolvedValue(null);

    renderHeader();

    await waitFor(() => {
      expect(screen.getByText('MFE Demo Application')).toBeDefined();
    });
  });

  it('should not show logout button when not authenticated', async () => {
    const authService = await import('../services/authService');
    vi.mocked(authService.default.getCurrentUser).mockResolvedValue(null);

    renderHeader();

    await waitFor(() => {
      expect(screen.queryByText('Logout')).toBeNull();
    });
  });

  it('should show username and logout button when authenticated', async () => {
    const authService = await import('../services/authService');
    vi.mocked(authService.default.getCurrentUser).mockResolvedValue({
      username: 'testuser',
      email: 'test@example.com',
      groups: ['user'],
    });

    renderHeader();

    await waitFor(() => {
      expect(screen.getByText('Welcome, testuser')).toBeDefined();
      expect(screen.getByText('Logout')).toBeDefined();
    });
  });

  it('should call logout when logout button is clicked', async () => {
    const authService = await import('../services/authService');
    const mockSignOut = vi.fn().mockResolvedValue(undefined);
    vi.mocked(authService.default.getCurrentUser).mockResolvedValue({
      username: 'testuser',
      email: 'test@example.com',
      groups: ['user'],
    });
    vi.mocked(authService.default.signOut).mockImplementation(mockSignOut);

    renderHeader();

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeDefined();
    });

    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('should handle logout error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const authService = await import('../services/authService');
    const mockSignOut = vi.fn().mockRejectedValue(new Error('Logout failed'));
    vi.mocked(authService.default.getCurrentUser).mockResolvedValue({
      username: 'testuser',
      email: 'test@example.com',
      groups: ['user'],
    });
    vi.mocked(authService.default.signOut).mockImplementation(mockSignOut);

    renderHeader();

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeDefined();
    });

    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
