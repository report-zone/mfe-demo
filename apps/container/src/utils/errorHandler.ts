/**
 * Error Handler Utility
 * 
 * Following Single Responsibility Principle (SRP),
 * error handling logic is centralized and reusable.
 */

export interface ErrorDetails {
  message: string;
  code?: string;
  originalError?: unknown;
}

/**
 * Extract error message from various error types
 */
export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
};

/**
 * Create standardized error details
 */
export const createErrorDetails = (error: unknown): ErrorDetails => {
  return {
    message: extractErrorMessage(error),
    originalError: error,
  };
};

/**
 * Log error with context
 */
export const logError = (context: string, error: unknown): void => {
  const errorDetails = createErrorDetails(error);
  console.error(`[${context}]`, errorDetails.message, errorDetails.originalError);
};

/**
 * Auth-specific error messages
 */
export const getAuthErrorMessage = (error: unknown): string => {
  const message = extractErrorMessage(error);
  
  // Map common auth errors to user-friendly messages
  if (message.includes('User does not exist')) {
    return 'Invalid username or password';
  }
  if (message.includes('Incorrect username or password')) {
    return 'Invalid username or password';
  }
  if (message.includes('User already exists')) {
    return 'An account with this username already exists';
  }
  if (message.includes('Invalid verification code')) {
    return 'The verification code you entered is invalid';
  }
  if (message.includes('Password does not conform')) {
    return 'Password does not meet requirements';
  }
  
  return message;
};
