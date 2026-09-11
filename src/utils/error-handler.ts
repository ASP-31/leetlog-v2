import { logger } from './logger';

const COMPONENT = 'ErrorHandler';

export class LeetLogError extends Error {
  public code: string;
  public recoverable: boolean;

  constructor(message: string, code: string, recoverable = true) {
    super(message);
    this.name = 'LeetLogError';
    this.code = code;
    this.recoverable = recoverable;
  }
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string,
  fallback?: T,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof LeetLogError) {
      logger.error(COMPONENT, `${context}: ${err.message} (${err.code})`);
    } else {
      logger.error(COMPONENT, `${context}: ${String(err)}`);
    }

    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

export function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) {
    return err.message.includes('fetch') || err.message.includes('network');
  }
  if (err instanceof Error) {
    return err.message.includes('Failed to fetch') || err.message.includes('NetworkError');
  }
  return false;
}

export function isRateLimitError(err: unknown): boolean {
  if (err instanceof Error) {
    return err.message.includes('403') || err.message.includes('rate limit');
  }
  return false;
}

export function getRetryDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 300000);
}
