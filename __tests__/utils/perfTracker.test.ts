/**
 * Tests for utils/perfTracker.ts
 */

import { createPerfTracker } from '../../utils/perfTracker';
import type { PerfTracker } from '../../utils/perfTracker';

describe('perfTracker', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('when debug mode is disabled', () => {
    beforeEach(() => {
      // isDebugMode() returns true when NODE_ENV=test, so override it
      process.env.NODE_ENV = 'production';
    });

    it('should return a no-op tracker', () => {
      const tracker = createPerfTracker('test');
      tracker.mark('step1');
      tracker.measure('step1');
      expect(tracker.entries()).toEqual([]);
    });

    it('should not throw when calling summary', () => {
      const tracker = createPerfTracker('test');
      expect(() => tracker.summary()).not.toThrow();
    });
  });

  describe('when debug mode is enabled', () => {
    // NODE_ENV=test by default, so isDebugMode() returns true

    it('should collect mark and measure entries', () => {
      const tracker = createPerfTracker('test');
      tracker.mark('step1');
      tracker.measure('step1');

      const entries = tracker.entries();
      expect(entries).toHaveLength(1);
      expect(entries[0].label).toBe('step1');
      expect(typeof entries[0].startTime).toBe('number');
      expect(typeof entries[0].duration).toBe('number');
      expect(entries[0].cached).toBe(false);
    });

    it('should track cached flag when set', () => {
      const tracker = createPerfTracker('test');
      tracker.mark('cachedStep', true);
      tracker.measure('cachedStep');

      const entries = tracker.entries();
      expect(entries[0].cached).toBe(true);
    });

    it('should handle multiple marks and measures', () => {
      const tracker = createPerfTracker('test');
      tracker.mark('step1');
      tracker.measure('step1');
      tracker.mark('step2');
      tracker.measure('step2');

      const entries = tracker.entries();
      expect(entries).toHaveLength(2);
      expect(entries[0].label).toBe('step1');
      expect(entries[1].label).toBe('step2');
    });

    it('should ignore measure without matching mark', () => {
      const tracker = createPerfTracker('test');
      tracker.measure('nonexistent');

      const entries = tracker.entries();
      expect(entries).toHaveLength(0);
    });

    it('should return a copy of entries', () => {
      const tracker = createPerfTracker('test');
      tracker.mark('step1');
      tracker.measure('step1');

      const entries1 = tracker.entries();
      const entries2 = tracker.entries();
      expect(entries1).not.toBe(entries2);
      expect(entries1).toEqual(entries2);
    });

    it('should log summary to console', () => {
      const groupCollapsedSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation();
      const tableSpy = jest.spyOn(console, 'table').mockImplementation();
      const groupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();

      const tracker = createPerfTracker('processDataset');
      tracker.mark('getEntityDisplayName');
      tracker.measure('getEntityDisplayName');
      tracker.summary();

      expect(groupCollapsedSpy).toHaveBeenCalledWith(
        expect.stringContaining('[BPFViewer] processDataset completed in')
      );
      expect(tableSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ Step: 'getEntityDisplayName' }),
        ])
      );
      expect(groupEndSpy).toHaveBeenCalled();

      groupCollapsedSpy.mockRestore();
      tableSpy.mockRestore();
      groupEndSpy.mockRestore();
    });

    it('should fall back to console.log when console.table is unavailable', () => {
      const originalTable = console.table;
      // @ts-expect-error - simulating missing console.table
      console.table = undefined;

      const groupCollapsedSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation();
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      const groupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation();

      const tracker = createPerfTracker('test');
      tracker.mark('step1');
      tracker.measure('step1');
      tracker.summary();

      expect(logSpy).toHaveBeenCalled();

      groupCollapsedSpy.mockRestore();
      logSpy.mockRestore();
      groupEndSpy.mockRestore();
      console.table = originalTable;
    });
  });
});
