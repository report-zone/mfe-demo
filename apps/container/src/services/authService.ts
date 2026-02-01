/**
 * AWS Cognito Authentication Service Implementation
 *
 * This service implements IAuthService using AWS Amplify/Cognito,
 * following the Dependency Inversion Principle (DIP).
 */

import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  confirmSignIn as amplifyConfirmSignIn,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  SignInInput,
  SignUpInput,
  ConfirmSignUpInput,
  ResetPasswordInput,
  ConfirmResetPasswordInput,
} from '@aws-amplify/auth';
import {
  IAuthService,
  AuthUser,
  SignUpParams,
  ConfirmSignUpParams,
  ResetPasswordParams,
  ConfirmResetPasswordParams,
  CompleteNewPasswordParams,
  SignInResult,
} from './interfaces/IAuthService';

/**
 * AWS Cognito Authentication Service Implementation
 * Implements IAuthService interface
 */
class CognitoAuthService implements IAuthService {
  /**
   * Sign in a user with username and password
   * Returns the next step required to complete sign-in
   */
  async signIn(username: string, password: string): Promise<SignInResult> {
    const signInInput: SignInInput = {
      username,
      password,
      options: {
        /* authFlowType: 'USER_PASSWORD_AUTH' */
      }, // should be able to remove authFlowType as USER_SRP_AUTH is the default
    };
    const result = await amplifySignIn(signInInput);

    // Check if user needs to set a new password (admin-created users)
    if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      return { nextStep: 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED' };
    }

    return { nextStep: 'DONE' };
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    await amplifySignOut();
  }

  /**
   * Sign up a new user
   */
  async signUp(params: SignUpParams): Promise<void> {
    const signUpInput: SignUpInput = {
      username: params.username,
      password: params.password,
      options: {
        userAttributes: {
          email: params.email,
        },
      },
    };
    await amplifySignUp(signUpInput);
  }

  /**
   * Confirm user sign up with verification code
   */
  async confirmSignUp(params: ConfirmSignUpParams): Promise<void> {
    const confirmInput: ConfirmSignUpInput = {
      username: params.username,
      confirmationCode: params.code,
    };
    await amplifyConfirmSignUp(confirmInput);
  }

  /**
   * Initiate password reset process
   */
  async resetPassword(params: ResetPasswordParams): Promise<void> {
    const resetInput: ResetPasswordInput = {
      username: params.username,
    };
    await amplifyResetPassword(resetInput);
  }

  /**
   * Confirm password reset with verification code
   */
  async confirmResetPassword(params: ConfirmResetPasswordParams): Promise<void> {
    const confirmInput: ConfirmResetPasswordInput = {
      username: params.username,
      confirmationCode: params.code,
      newPassword: params.newPassword,
    };
    await amplifyConfirmResetPassword(confirmInput);
  }

  /**
   * Complete new password challenge (for admin-created users)
   */
  async completeNewPassword(params: CompleteNewPasswordParams): Promise<void> {
    await amplifyConfirmSignIn({
      challengeResponse: params.newPassword,
    });
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      const groups = (session.tokens?.accessToken?.payload['cognito:groups'] as string[]) || [];

      return {
        username: currentUser.username,
        email: currentUser.signInDetails?.loginId,
        groups,
      };
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Check if current user has admin privileges
   */
  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.groups?.includes('admin') || false;
  }
}

// Export singleton instance
export const authService: IAuthService = new CognitoAuthService();

export default authService;
