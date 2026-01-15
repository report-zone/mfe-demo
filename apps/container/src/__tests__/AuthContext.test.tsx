import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

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

const TestComponent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-name">{user?.username || 'No User'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  it('should provide authentication state', async () => {
    const authService = await import('../services/authService');
    vi.mocked(authService.default.getCurrentUser).mockResolvedValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });
  });

  it('should provide user information when authenticated', async () => {
    const authService = await import('../services/authService');
    vi.mocked(authService.default.getCurrentUser).mockResolvedValue({
      username: 'testuser',
      email: 'test@example.com',
      groups: ['user'],
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('testuser');
    });
  });
});
