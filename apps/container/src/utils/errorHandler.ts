/**
 * Error Handler Utility
 * 
 * Following Single Responsibility Principle (SRP),
 * error handling logic is centralized and reusable.
 * 
 * Following Dependency Inversion Principle (DIP),
 * uses ILoggerService interface for logging instead of console directly.
 */

import { logger } from '../services/loggerService';

/**
 * Log error with context using logger service
 */
export const logError = (context: string, error: unknown): void => {
  const message = extractErrorMessage(error);
  const errorObj = error instanceof Error ? error : undefined;
  logger.error(message, context, errorObj);
};

/**
 * Extract error message from various error types
 */
function extractErrorMessage(error: unknown): string {
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
}
