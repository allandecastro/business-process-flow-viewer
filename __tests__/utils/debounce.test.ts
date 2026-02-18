/**
 * Tests for debounce utility
 */

import { debounce } from '../../utils/debounce';

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('delays function execution', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets delay on subsequent calls', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced();
    jest.advanceTimersByTime(50);
    debounced(); // Reset timer
    jest.advanceTimersByTime(50);

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes arguments to the debounced function', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced('arg1', 'arg2');
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('uses arguments from the last call', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced('first');
    debounced('second');
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('second');
  });

  it('can be called multiple times after delay', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced();
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    debounced();
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  describe('cancel', () => {
    it('cancels a pending debounced call', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced.cancel();
      jest.advanceTimersByTime(100);

      expect(fn).not.toHaveBeenCalled();
    });

    it('is safe to call cancel when no timer is pending', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      // Cancel with nothing pending — should not throw
      debounced.cancel();
      expect(fn).not.toHaveBeenCalled();
    });

    it('is safe to call cancel after the timer has already fired', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);

      // Cancel after fire — should not throw
      debounced.cancel();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('allows new calls after cancel', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced('first');
      debounced.cancel();
      jest.advanceTimersByTime(100);
      expect(fn).not.toHaveBeenCalled();

      // New call after cancel
      debounced('second');
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('second');
    });
  });
});
