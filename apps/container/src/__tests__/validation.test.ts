import { describe, it, expect } from 'vitest';
import {
  validatePassword,
  validatePasswordMatch,
  validateEmail,
  validateUsername,
  validateVerificationCode,
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

  describe('validateEmail', () => {
    it('should return valid for proper email format', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for email with subdomain', () => {
      const result = validateEmail('user@mail.example.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for email with plus sign', () => {
      const result = validateEmail('user+test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for email without @', () => {
      const result = validateEmail('testexample.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });

    it('should return invalid for email without domain', () => {
      const result = validateEmail('test@');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });

    it('should return invalid for empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });
  });

  describe('validateUsername', () => {
    it('should return valid for username with 3+ characters', () => {
      const result = validateUsername('user');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for long username', () => {
      const result = validateUsername('verylongusername123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for username with less than 3 characters', () => {
      const result = validateUsername('ab');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username must be at least 3 characters long');
    });

    it('should return invalid for empty username', () => {
      const result = validateUsername('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username must be at least 3 characters long');
    });
  });

  describe('validateVerificationCode', () => {
    it('should return valid for code with 6+ characters', () => {
      const result = validateVerificationCode('123456');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for longer code', () => {
      const result = validateVerificationCode('12345678');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for code with less than 6 characters', () => {
      const result = validateVerificationCode('12345');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Verification code must be at least 6 characters');
    });

    it('should return invalid for empty code', () => {
      const result = validateVerificationCode('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Verification code must be at least 6 characters');
    });
  });
});
