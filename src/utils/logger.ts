type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_LEVEL: LogLevel = 'debug';

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[LOG_LEVEL];
}

function formatMessage(component: string, message: string): string {
  return `[LeetLog][${component}] ${message}`;
}

export const logger = {
  debug(component: string, message: string, ...args: unknown[]) {
    if (shouldLog('debug')) {
      console.debug(formatMessage(component, message), ...args);
    }
  },

  info(component: string, message: string, ...args: unknown[]) {
    if (shouldLog('info')) {
      console.log(formatMessage(component, message), ...args);
    }
  },

  warn(component: string, message: string, ...args: unknown[]) {
    if (shouldLog('warn')) {
      console.warn(formatMessage(component, message), ...args);
    }
  },

  error(component: string, message: string, ...args: unknown[]) {
    if (shouldLog('error')) {
      console.error(formatMessage(component, message), ...args);
    }
  },
};