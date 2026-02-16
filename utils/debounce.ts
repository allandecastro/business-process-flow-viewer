/**
 * Debounce utility for performance-sensitive event handlers
 *
 * Creates a debounced version of a function that delays its execution
 * until after a specified delay has elapsed since the last invocation.
 *
 * Common use cases:
 * - Window resize events
 * - Scroll events
 * - Search input (keystroke)
 * - API calls triggered by user input
 *
 * Benefits:
 * - Reduces number of function calls
 * - Improves performance by preventing excessive re-renders
 * - Reduces API calls and network traffic
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds before function execution
 * @returns Debounced version of the function
 *
 * @example
 * ```typescript
 * const handleResize = debounce(() => {
 *   console.log('Window resized');
 * }, 150);
 *
 * window.addEventListener('resize', handleResize);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle utility for rate-limiting function execution
 *
 * Creates a throttled version of a function that executes at most once
 * per specified time period, regardless of how many times it's called.
 *
 * Difference from debounce:
 * - Debounce: Waits for silence before executing
 * - Throttle: Executes at regular intervals
 *
 * Common use cases:
 * - Scroll position tracking
 * - Mouse move tracking
 * - Analytics events
 *
 * @param fn - Function to throttle
 * @param limit - Minimum time in milliseconds between executions
 * @returns Throttled version of the function
 *
 * @example
 * ```typescript
 * const trackScroll = throttle(() => {
 *   console.log('Scroll position:', window.scrollY);
 * }, 100);
 *
 * window.addEventListener('scroll', trackScroll);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
