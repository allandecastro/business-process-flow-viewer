/**
 * Centralized logger for the BPF Viewer control
 *
 * - `error()`: Fatal / unrecoverable problems — always logged.
 * - `warn()`:  Recoverable issues — only logged in debug mode to reduce
 *   production noise. Dataverse has its own telemetry for critical errors.
 *
 * Enable debug logging at runtime by running in the browser console:
 *   sessionStorage.setItem('BPF_DEBUG', 'true')
 *
 * Disable again with:
 *   sessionStorage.removeItem('BPF_DEBUG')
 */

export function isDebugMode(): boolean {
  try {
    // Node.js / test environment — always log so test assertions work
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
      return true;
    }
    // Browser — opt-in via sessionStorage flag
    return (
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem('BPF_DEBUG') === 'true'
    );
  } catch {
    return false;
  }
}

export interface Logger {
  error(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
}

export function createLogger(prefix: string): Logger {
  return {
    /** Fatal / unrecoverable errors — always logged */
    error(message: string, ...args: unknown[]): void {
      console.error(`${prefix} ${message}`, ...args);
    },

    /** Recoverable warnings — only in debug mode */
    warn(message: string, ...args: unknown[]): void {
      if (isDebugMode()) {
        console.warn(`${prefix} ${message}`, ...args);
      }
    },
  };
}

/** Default logger for the main control */
export const logger = createLogger('[BPFViewer]');
