/**
 * Console Logger Service Implementation
 * 
 * Following Dependency Inversion Principle (DIP),
 * this is a concrete implementation of ILoggerService using console output.
 * Can be easily swapped with other implementations (e.g., remote logging, analytics).
 */

import { ILoggerService, LogLevel } from './interfaces/ILoggerService';

/**
 * Console-based logger implementation
 * Uses browser console for logging
 */
export class ConsoleLoggerService implements ILoggerService {
  private readonly prefix: string;

  constructor(prefix = '[MFE Demo]') {
    this.prefix = prefix;
  }

  /**
   * Formats a log message with context and metadata
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: Record<string, unknown>
  ): string {
    const contextStr = context ? ` [${context}]` : '';
    const timestamp = new Date().toISOString();
    let formatted = `${this.prefix}${contextStr} [${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (metadata && Object.keys(metadata).length > 0) {
      formatted += `\nMetadata: ${JSON.stringify(metadata, null, 2)}`;
    }
    
    return formatted;
  }

  debug(message: string, context?: string, metadata?: Record<string, unknown>): void {
    const formatted = this.formatMessage(LogLevel.DEBUG, message, context, metadata);
    console.debug(formatted);
  }

  info(message: string, context?: string, metadata?: Record<string, unknown>): void {
    const formatted = this.formatMessage(LogLevel.INFO, message, context, metadata);
    console.info(formatted);
  }

  warn(message: string, context?: string, metadata?: Record<string, unknown>): void {
    const formatted = this.formatMessage(LogLevel.WARN, message, context, metadata);
    console.warn(formatted);
  }

  error(
    message: string,
    context?: string,
    error?: Error | unknown,
    metadata?: Record<string, unknown>
  ): void {
    const formatted = this.formatMessage(LogLevel.ERROR, message, context, metadata);
    console.error(formatted);
    
    if (error) {
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        if (error.stack) {
          console.error('Stack trace:', error.stack);
        }
      } else {
        console.error('Error details:', error);
      }
    }
  }
}

/**
 * Default logger instance
 * Export a singleton instance for convenience
 */
export const logger: ILoggerService = new ConsoleLoggerService();
