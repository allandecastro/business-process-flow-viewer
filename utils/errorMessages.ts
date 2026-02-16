/**
 * User-friendly error message generation
 *
 * Provides consistent, helpful error messages instead of raw technical errors
 */

/**
 * Custom error class for BPF-specific errors
 */
export class BPFError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'BPFError';
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BPFError);
    }
  }
}

/**
 * Error codes for common scenarios
 */
export const ErrorCodes = {
  FETCH_FAILED: 'FETCH_FAILED',
  INVALID_CONFIG: 'INVALID_CONFIG',
  NO_PERMISSION: 'NO_PERMISSION',
  STAGE_NOT_FOUND: 'STAGE_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

/**
 * Get user-friendly error message from error object
 *
 * Translates technical errors into helpful messages for end users
 *
 * @param error - Error object (can be any type)
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  // Handle BPFError instances
  if (error instanceof BPFError) {
    switch (error.code) {
      case ErrorCodes.FETCH_FAILED:
        return 'Unable to load process flow data. Please check your connection and try again.';
      case ErrorCodes.INVALID_CONFIG:
        return 'The process flow configuration is invalid. Please contact your administrator.';
      case ErrorCodes.NO_PERMISSION:
        return 'You do not have permission to view this process flow.';
      case ErrorCodes.STAGE_NOT_FOUND:
        return 'Process flow stages could not be loaded. The process may have been deleted or modified.';
      case ErrorCodes.NETWORK_ERROR:
        return 'Network error occurred. Please check your connection and try again.';
      case ErrorCodes.TIMEOUT:
        return 'Request timed out. Please try again.';
      case ErrorCodes.VALIDATION_ERROR:
        return error.message || 'Validation error occurred.';
      default:
        return `Error: ${error.message}`;
    }
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    // Check for common Dataverse error codes
    const message = error.message;

    // Permission errors
    if (message.includes('0x80040220') || message.includes('SecLib::AccessCheckEx')) {
      return 'You do not have permission to access this record.';
    }

    // Not found errors
    if (message.includes('0x80040217') || message.includes('does not exist')) {
      return 'The record or process flow was not found.';
    }

    // Network errors
    if (message.includes('NetworkError') || message.includes('Failed to fetch')) {
      return 'Network error occurred. Please check your connection and try again.';
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('Timeout')) {
      return 'Request timed out. Please try again.';
    }

    // Generic error with message
    return `Error: ${message}`;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return `Error: ${error}`;
  }

  // Unknown error type
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if error indicates a permission issue
 *
 * @param error - Error to check
 * @returns True if error is permission-related
 */
export function isPermissionError(error: unknown): boolean {
  if (error instanceof BPFError && error.code === ErrorCodes.NO_PERMISSION) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message;
    return (
      message.includes('0x80040220') ||
      message.includes('SecLib::AccessCheckEx') ||
      message.includes('permission')
    );
  }

  return false;
}

/**
 * Check if error indicates a network issue
 *
 * @param error - Error to check
 * @returns True if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof BPFError && error.code === ErrorCodes.NETWORK_ERROR) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message;
    return (
      message.includes('NetworkError') ||
      message.includes('Failed to fetch') ||
      message.includes('Network request failed')
    );
  }

  return false;
}
