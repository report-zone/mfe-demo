import { describe, it, expect } from 'vitest';
import {
  validatePassword,
  validatePasswordMatch,
} from '../utils/validation';

describe('validation utilities', () => {
  describe('validatePassword', () => {
    it('should return valid for password with 8+ characters', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for password with less than 8 characters', () => {
      const result = validatePassword('pass');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long');
    });

    it('should return invalid for empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long');
    });
  });

  describe('validatePasswordMatch', () => {
    it('should return valid when passwords match', () => {
      const result = validatePasswordMatch('password123', 'password123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid when passwords do not match', () => {
      const result = validatePasswordMatch('password123', 'password456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Passwords do not match');
    });

    it('should return invalid when one password is empty', () => {
      const result = validatePasswordMatch('password123', '');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Passwords do not match');
    });
  });
});
