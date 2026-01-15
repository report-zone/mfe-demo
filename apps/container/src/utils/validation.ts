/**
 * Form Validation Utilities
 * 
 * Following Single Responsibility Principle (SRP),
 * validation logic is separated from component logic.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
    };
  }
  return { isValid: true };
};

/**
 * Validates password confirmation matches
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Passwords do not match',
    };
  }
  return { isValid: true };
};

/**
 * Validates email format
 * Note: This is a basic email validation. For production use with complex requirements,
 * consider using a dedicated email validation library.
 */
export const validateEmail = (email: string): ValidationResult => {
  // More comprehensive email regex that handles most common cases
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }
  return { isValid: true };
};

/**
 * Validates username format
 */
export const validateUsername = (username: string): ValidationResult => {
  if (username.length < 3) {
    return {
      isValid: false,
      error: 'Username must be at least 3 characters long',
    };
  }
  return { isValid: true };
};

/**
 * Validates verification code format
 */
export const validateVerificationCode = (code: string): ValidationResult => {
  if (code.length < 6) {
    return {
      isValid: false,
      error: 'Verification code must be at least 6 characters',
    };
  }
  return { isValid: true };
};
