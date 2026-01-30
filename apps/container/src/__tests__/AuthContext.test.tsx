import React from 'react';
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
    completeNewPassword: vi.fn(),
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

  it('should return DONE when login succeeds without password change required', async () => {
    const authService = await import('../services/authService');
    vi.mocked(authService.default.getCurrentUser).mockResolvedValue(null);
    vi.mocked(authService.default.signIn).mockResolvedValue({ nextStep: 'DONE' });

    const LoginTestComponent = () => {
      const { login } = useAuth();
      const [result, setResult] = React.useState<string | null>(null);
      
      const handleLogin = async () => {
        const loginResult = await login('user', 'pass');
        setResult(loginResult.nextStep);
      };

      return (
        <div>
          <button onClick={handleLogin}>Login</button>
          <div data-testid="result">{result || 'No result'}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <LoginTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Login')).toBeDefined();
    });

    const { userEvent } = await import('@testing-library/user-event');
    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('DONE');
    });
  });

  it('should return CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED when password change is required', async () => {
    const authService = await import('../services/authService');
    vi.mocked(authService.default.getCurrentUser).mockResolvedValue(null);
    vi.mocked(authService.default.signIn).mockResolvedValue({ nextStep: 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED' });

    const LoginTestComponent = () => {
      const { login } = useAuth();
      const [result, setResult] = React.useState<string | null>(null);
      
      const handleLogin = async () => {
        const loginResult = await login('user', 'pass');
        setResult(loginResult.nextStep);
      };

      return (
        <div>
          <button onClick={handleLogin}>Login</button>
          <div data-testid="result">{result || 'No result'}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <LoginTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Login')).toBeDefined();
    });

    const { userEvent } = await import('@testing-library/user-event');
    await userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED');
    });
  });

  it('should complete new password successfully', async () => {
    const authService = await import('../services/authService');
    vi.mocked(authService.default.getCurrentUser)
      .mockResolvedValueOnce(null)
      .mockResolvedValue({
        username: 'testuser',
        email: 'test@example.com',
        groups: ['user'],
      });
    vi.mocked(authService.default.completeNewPassword).mockResolvedValue(undefined);

    const CompletePasswordTestComponent = () => {
      const { completeNewPassword, isAuthenticated } = useAuth();
      const [completed, setCompleted] = React.useState(false);
      
      const handleComplete = async () => {
        await completeNewPassword('newPassword123');
        setCompleted(true);
      };

      return (
        <div>
          <button onClick={handleComplete}>Complete Password</button>
          <div data-testid="completed">{completed ? 'Completed' : 'Not Completed'}</div>
          <div data-testid="auth">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <CompletePasswordTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Complete Password')).toBeDefined();
    });

    const { userEvent } = await import('@testing-library/user-event');
    await userEvent.click(screen.getByText('Complete Password'));

    await waitFor(() => {
      expect(screen.getByTestId('completed')).toHaveTextContent('Completed');
      expect(authService.default.completeNewPassword).toHaveBeenCalledWith({ newPassword: 'newPassword123' });
    });
  });
});
