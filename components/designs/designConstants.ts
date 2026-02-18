/**
 * Shared design constants for BPF design components.
 *
 * Centralizes magic numbers that are reused across multiple designs
 * so they can be tuned from a single place.
 */

/** Default transition duration for hover/state changes (e.g., marker scale, color) */
export const TRANSITION_DURATION = '0.2s';

/** Animation duration for the active-stage pulse effect */
export const PULSE_DURATION = '2s';

/** Transition duration for progress bar width changes */
export const PROGRESS_TRANSITION_DURATION = '0.5s';

/** Standard marker sizes (circle/stepper/line/gradient) */
export const MARKER_SIZE = {
  small: '20px',
  medium: '24px',
  large: '32px',
} as const;

/** Connector dimensions between stages */
export const CONNECTOR = {
  height: '2px',
  minWidth: '8px',
} as const;

/** Label font sizes */
export const LABEL_FONT_SIZE = {
  small: '9px',
  medium: '10px',
  regular: '11px',
  large: '12px',
} as const;
