/**
 * Debounce utility for performance-sensitive event handlers
 *
 * Creates a debounced version of a function that delays its execution
 * until after a specified delay has elapsed since the last invocation.
 * The returned function includes a `.cancel()` method to clear pending timers.
 *
 * Common use cases:
 * - Window resize events
 * - Scroll events
 * - Search input (keystroke)
 * - API calls triggered by user input
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds before function execution
 * @returns Debounced version of the function with a `.cancel()` method
 *
 * @example
 * ```typescript
 * const handleResize = debounce(() => {
 *   console.log('Window resized');
 * }, 150);
 *
 * window.addEventListener('resize', handleResize);
 *
 * // Cleanup: cancel pending timer
 * handleResize.cancel();
 * ```
 */

export interface DebouncedFunction<T extends (...args: unknown[]) => void> {
  (...args: Parameters<T>): void;
  cancel(): void;
}

// `any[]` is required here: TypeScript needs it for Parameters<T> inference on generic function constraints
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced as DebouncedFunction<T>;
}
