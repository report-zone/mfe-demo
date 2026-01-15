import { describe, it, expect, vi } from 'vitest';
import {
  extractErrorMessage,
  createErrorDetails,
  logError,
  getAuthErrorMessage,
} from '../utils/errorHandler';

describe('errorHandler utilities', () => {
  describe('extractErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error message');
      expect(extractErrorMessage(error)).toBe('Test error message');
    });

    it('should return string error as-is', () => {
      expect(extractErrorMessage('String error')).toBe('String error');
    });

    it('should extract message from object with message property', () => {
      const error = { message: 'Object error message' };
      expect(extractErrorMessage(error)).toBe('Object error message');
    });

    it('should return default message for unknown error type', () => {
      expect(extractErrorMessage(null)).toBe('An unknown error occurred');
    });

    it('should return default message for undefined', () => {
      expect(extractErrorMessage(undefined)).toBe('An unknown error occurred');
    });

    it('should return default message for number', () => {
      expect(extractErrorMessage(123)).toBe('An unknown error occurred');
    });
  });

  describe('createErrorDetails', () => {
    it('should create error details from Error object', () => {
      const error = new Error('Test error');
      const details = createErrorDetails(error);
      expect(details.message).toBe('Test error');
      expect(details.originalError).toBe(error);
    });

    it('should create error details from string', () => {
      const details = createErrorDetails('String error');
      expect(details.message).toBe('String error');
      expect(details.originalError).toBe('String error');
    });

    it('should create error details from object', () => {
      const error = { message: 'Object error' };
      const details = createErrorDetails(error);
      expect(details.message).toBe('Object error');
      expect(details.originalError).toBe(error);
    });
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      
      logError('TestContext', error);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[TestContext]',
        'Test error',
        error
      );
      
      consoleErrorSpy.mockRestore();
    });

    it('should log string error with context', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      logError('TestContext', 'String error');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[TestContext]',
        'String error',
        'String error'
      );
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getAuthErrorMessage', () => {
    it('should return user-friendly message for "User does not exist"', () => {
      const error = new Error('User does not exist');
      expect(getAuthErrorMessage(error)).toBe('Invalid username or password');
    });

    it('should return user-friendly message for "Incorrect username or password"', () => {
      const error = new Error('Incorrect username or password');
      expect(getAuthErrorMessage(error)).toBe('Invalid username or password');
    });

    it('should return user-friendly message for "User already exists"', () => {
      const error = new Error('User already exists');
      expect(getAuthErrorMessage(error)).toBe('An account with this username already exists');
    });

    it('should return user-friendly message for "Invalid verification code"', () => {
      const error = new Error('Invalid verification code provided');
      expect(getAuthErrorMessage(error)).toBe('The verification code you entered is invalid');
    });

    it('should return user-friendly message for password conformity error', () => {
      const error = new Error('Password does not conform to policy');
      expect(getAuthErrorMessage(error)).toBe('Password does not meet requirements');
    });

    it('should return original message for unknown error', () => {
      const error = new Error('Unknown auth error');
      expect(getAuthErrorMessage(error)).toBe('Unknown auth error');
    });

    it('should handle string errors', () => {
      expect(getAuthErrorMessage('User already exists')).toBe('An account with this username already exists');
    });
  });
});
