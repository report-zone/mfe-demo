import { describe, it, expect, vi } from 'vitest';
import { logError } from '../utils/errorHandler';

describe('errorHandler utilities', () => {
  describe('logError', () => {
    it('should log error with context', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      
      logError('TestContext', error);
      
      // Logger service formats messages, so we check that console.error was called
      expect(consoleErrorSpy).toHaveBeenCalled();
      // Verify the first call contains the formatted message with context
      const firstCall = consoleErrorSpy.mock.calls[0][0];
      expect(firstCall).toContain('TestContext');
      expect(firstCall).toContain('Test error');
      expect(firstCall).toContain('ERROR');
      
      consoleErrorSpy.mockRestore();
    });

    it('should log string error with context', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      logError('TestContext', 'String error');
      
      // Logger service formats messages, so we check that console.error was called
      expect(consoleErrorSpy).toHaveBeenCalled();
      // Verify the call contains the formatted message with context
      const firstCall = consoleErrorSpy.mock.calls[0][0];
      expect(firstCall).toContain('TestContext');
      expect(firstCall).toContain('String error');
      expect(firstCall).toContain('ERROR');
      
      consoleErrorSpy.mockRestore();
    });
  });
});
