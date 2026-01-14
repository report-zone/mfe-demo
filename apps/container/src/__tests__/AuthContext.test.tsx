import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Mock AWS Amplify
vi.mock('aws-amplify/auth', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
  fetchAuthSession: vi.fn(),
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
    const { getCurrentUser } = await import('aws-amplify/auth');
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('Not authenticated'));

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
    const { getCurrentUser, fetchAuthSession } = await import('aws-amplify/auth');
    vi.mocked(getCurrentUser).mockResolvedValue({
      username: 'testuser',
      userId: '123',
      signInDetails: {
        loginId: 'test@example.com',
      },
    } as never);
    
    vi.mocked(fetchAuthSession).mockResolvedValue({
      tokens: {
        accessToken: {
          payload: {
            'cognito:groups': ['user'],
          },
        },
      },
    } as never);

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
