/**
 * Mock Authentication Service for Testing
 * 
 * This is a temporary service for testing purposes only.
 * It bypasses actual authentication.
 */

import {
  IAuthService,
  AuthUser,
  SignUpParams,
  ConfirmSignUpParams,
  ResetPasswordParams,
  ConfirmResetPasswordParams,
} from './interfaces/IAuthService';

class MockAuthService implements IAuthService {
  private currentUser: AuthUser | null = {
    username: 'testuser',
    email: 'testuser@example.com',
    groups: ['users'],
  };

  async signIn(username: string, _password: string): Promise<void> {
    this.currentUser = {
      username,
      email: `${username}@example.com`,
      groups: ['users'],
    };
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
  }

  async signUp(_params: SignUpParams): Promise<void> {
    // Mock implementation
  }

  async confirmSignUp(_params: ConfirmSignUpParams): Promise<void> {
    // Mock implementation
  }

  async resetPassword(_params: ResetPasswordParams): Promise<void> {
    // Mock implementation
  }

  async confirmResetPassword(_params: ConfirmResetPasswordParams): Promise<void> {
    // Mock implementation
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.currentUser;
  }

  async isAuthenticated(): Promise<boolean> {
    return this.currentUser !== null;
  }

  async isAdmin(): Promise<boolean> {
    return this.currentUser?.groups?.includes('admin') ?? false;
  }
}

export default new MockAuthService();
