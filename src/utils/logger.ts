/**
 * Logging utility with levels for better control of console output
 */

// Log levels
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Get log level from environment or default to 'info'
const currentLogLevel: LogLevel = (import.meta.env?.VITE_LOG_LEVEL as LogLevel) || 'info';

// Log level priorities
const logLevelPriorities: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Check if we should log based on current level
const shouldLog = (level: LogLevel): boolean => {
  return logLevelPriorities[level] <= logLevelPriorities[currentLogLevel];
};

// Format log message with timestamp and level
const formatLogMessage = (level: LogLevel, message: string, ...args: any[]): [string, ...any[]] => {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  return [formattedMessage, ...args];
};

// Main logging functions
export const logger = {
  error: (message: string, ...args: any[]) => {
    if (shouldLog('error')) {
      console.error(...formatLogMessage('error', message, ...args));
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(...formatLogMessage('warn', message, ...args));
    }
  },

  info: (message: string, ...args: any[]) => {
    if (shouldLog('info')) {
      console.info(...formatLogMessage('info', message, ...args));
    }
  },

  debug: (message: string, ...args: any[]) => {
    if (shouldLog('debug')) {
      console.debug(...formatLogMessage('debug', message, ...args));
    }
  },

  // Log only in development
  dev: (message: string, ...args: any[]) => {
    if (import.meta.env?.DEV) {
      console.log(`[DEV] ${message}`, ...args);
    }
  }
};

// Export default logger
export default logger;