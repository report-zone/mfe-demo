/**
 * Console Logger Service Implementation
 * 
 * Following Dependency Inversion Principle (DIP),
 * this is a concrete implementation of ILoggerService using console output.
 * Can be easily swapped with other implementations (e.g., remote logging, analytics).
 */

import { ILoggerService, LogLevel } from './interfaces/ILoggerService';

/**
 * Sensitive fields to redact from logs
 * Using Set for O(1) lookup performance
 */
const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'apikey',
  'secret',
  'authorization',
  'cookie',
  'key',
  'auth',
  'session',
  'bearer',
  'credentials',
]);

/**
 * Sanitizes metadata by redacting sensitive fields
 */
function sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    // Redact if the key contains any sensitive field name
    const isSensitive = Array.from(SENSITIVE_FIELDS).some(field => lowerKey.includes(field));
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && !(value instanceof Error)) {
      // Recursively sanitize nested plain objects only
      sanitized[key] = sanitizeMetadata(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

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
      const sanitized = sanitizeMetadata(metadata);
      formatted += `\nMetadata: ${JSON.stringify(sanitized, null, 2)}`;
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
