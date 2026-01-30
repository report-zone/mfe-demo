/**
 * Auth Context Interfaces
 * 
 * Following Interface Segregation Principle (ISP),
 * we split the monolithic AuthContextType into smaller,
 * focused interfaces so clients only depend on what they need.
 */

export interface User {
  username: string;
  email?: string;
  groups?: string[];
}

/**
 * Login result indicating the next step required
 */
export type LoginResult = 
  | { nextStep: 'DONE' }
  | { nextStep: 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED' };

/**
 * Authentication State - Read-only authentication information
 */
export interface IAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

/**
 * Authentication Actions - Login/Logout operations
 */
export interface IAuthActions {
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

/**
 * Sign Up Operations - User registration
 */
export interface ISignUpOperations {
  signUp: (username: string, password: string, email: string) => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
}

/**
 * Password Reset Operations - Password recovery
 */
export interface IPasswordReset {
  resetPassword: (username: string) => Promise<void>;
  confirmResetPassword: (username: string, code: string, newPassword: string) => Promise<void>;
}

/**
 * Force Change Password Operations - For admin-created users
 */
export interface IForceChangePassword {
  completeNewPassword: (newPassword: string) => Promise<void>;
}

/**
 * Complete Auth Context - Combines all auth interfaces
 * Use this when you need full auth functionality
 */
export interface IAuthContext extends IAuthState, IAuthActions, ISignUpOperations, IPasswordReset, IForceChangePassword {}
