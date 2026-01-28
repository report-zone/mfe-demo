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
