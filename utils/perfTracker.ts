/**
 * Lightweight performance tracker for BPF Viewer
 *
 * Collects timing metrics for Dataverse API calls and renders a
 * structured summary in the browser console.
 *
 * Metrics are only collected when debug mode is enabled:
 *   sessionStorage.setItem('BPF_DEBUG', 'true')
 *
 * Usage:
 *   const perf = createPerfTracker('processDataset');
 *   perf.mark('getEntityDisplayName');
 *   await getEntityDisplayName();
 *   perf.measure('getEntityDisplayName');
 *   perf.summary();  // logs table to console
 */

import { isDebugMode } from './logger';

export interface PerfEntry {
  label: string;
  startTime: number;
  duration: number | null;
  cached: boolean;
}

export interface PerfTracker {
  /** Mark the start of a timed operation */
  mark(label: string, cached?: boolean): void;
  /** Measure the duration since the matching mark */
  measure(label: string): void;
  /** Get all collected entries */
  entries(): PerfEntry[];
  /** Log a formatted summary table to the console */
  summary(): void;
}

const NO_OP_TRACKER: PerfTracker = {
  mark: () => {},
  measure: () => {},
  entries: () => [],
  summary: () => {},
};

export function createPerfTracker(scope: string): PerfTracker {
  if (!isDebugMode()) {
    return NO_OP_TRACKER;
  }

  const marks = new Map<string, PerfEntry>();
  const completed: PerfEntry[] = [];
  const scopeStart = Date.now();

  return {
    mark(label: string, cached = false): void {
      marks.set(label, {
        label,
        startTime: Date.now() - scopeStart,
        duration: null,
        cached,
      });
    },

    measure(label: string): void {
      const entry = marks.get(label);
      if (entry) {
        entry.duration = Date.now() - scopeStart - entry.startTime;
        completed.push(entry);
        marks.delete(label);
      }
    },

    entries(): PerfEntry[] {
      return [...completed];
    },

    summary(): void {
      const totalMs = Date.now() - scopeStart;
      const rows = completed.map(e => ({
        Step: e.label,
        'Start (ms)': e.startTime,
        'Duration (ms)': e.duration ?? '?',
        Cached: e.cached ? 'yes' : '',
      }));

      console.groupCollapsed(
        `[BPFViewer] ${scope} completed in ${totalMs}ms (${completed.length} steps)`
      );
      if (typeof console.table === 'function') {
        console.table(rows);
      } else {
        rows.forEach(r => console.log(r));
      }
      console.groupEnd();
    },
  };
}
