/**
 * Logger Service Interface
 * 
 * Following Dependency Inversion Principle (DIP),
 * this interface allows for different logging implementations
 * (console, remote logging, analytics, etc.) without changing client code.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Logger Service Interface
 * Clients depend on this abstraction rather than concrete implementations
 */
export interface ILoggerService {
  /**
   * Log a debug message
   */
  debug(message: string, context?: string, metadata?: Record<string, unknown>): void;

  /**
   * Log an info message
   */
  info(message: string, context?: string, metadata?: Record<string, unknown>): void;

  /**
   * Log a warning
   */
  warn(message: string, context?: string, metadata?: Record<string, unknown>): void;

  /**
   * Log an error
   */
  error(message: string, context?: string, error?: Error | unknown, metadata?: Record<string, unknown>): void;
}
