/**
 * Authentication Service Interface
 * 
 * This interface defines the contract for authentication services,
 * following the Dependency Inversion Principle (DIP).
 * Components depend on this abstraction rather than concrete implementations.
 */

export interface AuthUser {
  username: string;
  email?: string;
  groups?: string[];
}

export interface SignUpParams {
  username: string;
  password: string;
  email: string;
}

export interface ConfirmSignUpParams {
  username: string;
  code: string;
}

export interface ResetPasswordParams {
  username: string;
}

export interface ConfirmResetPasswordParams {
  username: string;
  code: string;
  newPassword: string;
}

export interface CompleteNewPasswordParams {
  newPassword: string;
}

/**
 * Sign-in result indicating the next step required
 */
export type SignInResult = 
  | { nextStep: 'DONE' }
  | { nextStep: 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED' };

/**
 * IAuthService - Authentication abstraction
 * 
 * Allows swapping between different auth providers (AWS Cognito, Auth0, Firebase, etc.)
 * without changing dependent code.
 */
export interface IAuthService {
  /**
   * Sign in a user with username and password
   * Returns the next step required to complete sign-in
   */
  signIn(username: string, password: string): Promise<SignInResult>;

  /**
   * Sign out the current user
   */
  signOut(): Promise<void>;

  /**
   * Sign up a new user
   */
  signUp(params: SignUpParams): Promise<void>;

  /**
   * Confirm user sign up with verification code
   */
  confirmSignUp(params: ConfirmSignUpParams): Promise<void>;

  /**
   * Initiate password reset process
   */
  resetPassword(params: ResetPasswordParams): Promise<void>;

  /**
   * Confirm password reset with verification code
   */
  confirmResetPassword(params: ConfirmResetPasswordParams): Promise<void>;

  /**
   * Complete new password challenge (for admin-created users)
   */
  completeNewPassword(params: CompleteNewPasswordParams): Promise<void>;

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): Promise<AuthUser | null>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Check if current user has admin privileges
   */
  isAdmin(): Promise<boolean>;
}
