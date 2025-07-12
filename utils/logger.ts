/**
 * Log levels for controlling logger output
 * NONE - No logging at all
 * ERROR - Only errors
 * WARN - Warnings and errors
 * INFO - Info, warnings, and errors
 * DEBUG - All logs including debug
 */
export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
}

interface LoggerConfig {
  level: LogLevel;
  prefix?: string;
  isDevelopment?: boolean;
}

class Logger {
  private level: LogLevel;
  private prefix: string;
  private isDevelopment: boolean;

  constructor(config: LoggerConfig) {
    this.level = config.level;
    this.prefix = config.prefix || '[PMapper]';
    this.isDevelopment = config.isDevelopment ?? process.env.NODE_ENV !== 'production';
  }

  private shouldLog(level: LogLevel): boolean {
    return this.isDevelopment && level <= this.level;
  }

  private formatMessage(level: string, ...args: unknown[]): unknown[] {
    const timestamp = new Date().toISOString();
    return [`${this.prefix} [${timestamp}] [${level}]`, ...args];
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(...this.formatMessage('DEBUG', ...args));
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(...this.formatMessage('INFO', ...args));
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(...this.formatMessage('WARN', ...args));
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(...this.formatMessage('ERROR', ...args));
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }
}

// Create default logger instance
const defaultLogger = new Logger({
  level: process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG,
  prefix: '[PMapper]',
});

/**
 * Default logger instance with manual override controls
 * 
 * Usage:
 *   logger.disable()                    // Turn off all logging
 *   logger.enable()                     // Restore default log level based on environment
 *   logger.setLevel(logger.LogLevel.WARN)  // Set specific log level
 *   logger.setLevel(logger.LogLevel.NONE)  // Another way to disable all logging
 */
export const logger = {
  debug: defaultLogger.debug.bind(defaultLogger),
  info: defaultLogger.info.bind(defaultLogger),
  warn: defaultLogger.warn.bind(defaultLogger),
  error: defaultLogger.error.bind(defaultLogger),
  setLevel: defaultLogger.setLevel.bind(defaultLogger),
  getLevel: defaultLogger.getLevel.bind(defaultLogger),
  // Convenience methods
  disable: () => defaultLogger.setLevel(LogLevel.NONE),
  enable: () => defaultLogger.setLevel(process.env.NODE_ENV === 'production' ? LogLevel.ERROR : LogLevel.DEBUG),
  LogLevel, // Export LogLevel enum for direct access
};

// Export factory function for creating custom loggers
export function createLogger(config: Partial<LoggerConfig>): Logger {
  return new Logger({
    level: config.level ?? defaultLogger.getLevel(),
    prefix: config.prefix,
    isDevelopment: config.isDevelopment,
  });
}