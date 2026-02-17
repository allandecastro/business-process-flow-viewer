/**
 * Tests for errorMessages utility
 */

import {
  BPFError,
  ErrorCodes,
  getErrorMessage,
  isPermissionError,
  isNetworkError,
} from '../../utils/errorMessages';

describe('BPFError', () => {
  it('creates error with code and message', () => {
    const error = new BPFError('test message', ErrorCodes.FETCH_FAILED);
    expect(error.message).toBe('test message');
    expect(error.code).toBe('FETCH_FAILED');
    expect(error.name).toBe('BPFError');
  });

  it('creates error with details', () => {
    const details = { recordId: '123' };
    const error = new BPFError('test', ErrorCodes.FETCH_FAILED, details);
    expect(error.details).toEqual(details);
  });

  it('is an instance of Error', () => {
    const error = new BPFError('test', ErrorCodes.FETCH_FAILED);
    expect(error instanceof Error).toBe(true);
  });
});

describe('getErrorMessage', () => {
  describe('BPFError handling', () => {
    it('returns friendly message for FETCH_FAILED', () => {
      const error = new BPFError('fetch failed', ErrorCodes.FETCH_FAILED);
      expect(getErrorMessage(error)).toContain('Unable to load process flow data');
    });

    it('returns friendly message for INVALID_CONFIG', () => {
      const error = new BPFError('bad config', ErrorCodes.INVALID_CONFIG);
      expect(getErrorMessage(error)).toContain('configuration is invalid');
    });

    it('returns friendly message for NO_PERMISSION', () => {
      const error = new BPFError('no access', ErrorCodes.NO_PERMISSION);
      expect(getErrorMessage(error)).toContain('do not have permission');
    });

    it('returns friendly message for STAGE_NOT_FOUND', () => {
      const error = new BPFError('not found', ErrorCodes.STAGE_NOT_FOUND);
      expect(getErrorMessage(error)).toContain('stages could not be loaded');
    });

    it('returns friendly message for NETWORK_ERROR', () => {
      const error = new BPFError('network', ErrorCodes.NETWORK_ERROR);
      expect(getErrorMessage(error)).toContain('Network error');
    });

    it('returns friendly message for TIMEOUT', () => {
      const error = new BPFError('timeout', ErrorCodes.TIMEOUT);
      expect(getErrorMessage(error)).toContain('timed out');
    });

    it('returns message for VALIDATION_ERROR', () => {
      const error = new BPFError('Invalid field name', ErrorCodes.VALIDATION_ERROR);
      expect(getErrorMessage(error)).toBe('Invalid field name');
    });

    it('returns message for VALIDATION_ERROR with empty message', () => {
      const error = new BPFError('', ErrorCodes.VALIDATION_ERROR);
      expect(getErrorMessage(error)).toContain('Validation error');
    });

    it('returns fallback for unknown BPFError code', () => {
      const error = new BPFError('something went wrong', 'UNKNOWN_CODE');
      expect(getErrorMessage(error)).toContain('something went wrong');
    });
  });

  describe('standard Error handling', () => {
    it('detects Dataverse permission errors (0x80040220)', () => {
      const error = new Error('Error code: 0x80040220');
      expect(getErrorMessage(error)).toContain('do not have permission');
    });

    it('detects Dataverse permission errors (SecLib)', () => {
      const error = new Error('SecLib::AccessCheckEx failed');
      expect(getErrorMessage(error)).toContain('do not have permission');
    });

    it('detects not found errors (0x80040217)', () => {
      const error = new Error('Error code: 0x80040217');
      expect(getErrorMessage(error)).toContain('not found');
    });

    it('detects not found errors (does not exist)', () => {
      const error = new Error('Entity does not exist');
      expect(getErrorMessage(error)).toContain('not found');
    });

    it('detects network errors (NetworkError)', () => {
      const error = new Error('NetworkError when attempting to fetch');
      expect(getErrorMessage(error)).toContain('Network error');
    });

    it('detects network errors (Failed to fetch)', () => {
      const error = new Error('Failed to fetch');
      expect(getErrorMessage(error)).toContain('Network error');
    });

    it('detects timeout errors', () => {
      const error = new Error('Request timeout exceeded');
      expect(getErrorMessage(error)).toContain('timed out');
    });

    it('detects Timeout with capital T', () => {
      const error = new Error('Timeout error');
      expect(getErrorMessage(error)).toContain('timed out');
    });

    it('returns generic message for unknown Error', () => {
      const error = new Error('Something broke');
      expect(getErrorMessage(error)).toBe('Error: Something broke');
    });
  });

  describe('other error types', () => {
    it('handles string errors', () => {
      expect(getErrorMessage('a string error')).toBe('Error: a string error');
    });

    it('handles unknown error types', () => {
      expect(getErrorMessage(42)).toBe('An unexpected error occurred. Please try again.');
    });

    it('handles null error', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
    });

    it('handles undefined error', () => {
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred. Please try again.');
    });
  });
});

describe('isPermissionError', () => {
  it('returns true for BPFError with NO_PERMISSION code', () => {
    const error = new BPFError('no access', ErrorCodes.NO_PERMISSION);
    expect(isPermissionError(error)).toBe(true);
  });

  it('returns false for BPFError with other codes', () => {
    const error = new BPFError('fail', ErrorCodes.FETCH_FAILED);
    expect(isPermissionError(error)).toBe(false);
  });

  it('returns true for Error with 0x80040220', () => {
    expect(isPermissionError(new Error('0x80040220'))).toBe(true);
  });

  it('returns true for Error with SecLib::AccessCheckEx', () => {
    expect(isPermissionError(new Error('SecLib::AccessCheckEx'))).toBe(true);
  });

  it('returns true for Error with "permission" in message', () => {
    expect(isPermissionError(new Error('You do not have permission'))).toBe(true);
  });

  it('returns false for non-permission Error', () => {
    expect(isPermissionError(new Error('network error'))).toBe(false);
  });

  it('returns false for non-Error types', () => {
    expect(isPermissionError('string error')).toBe(false);
    expect(isPermissionError(null)).toBe(false);
    expect(isPermissionError(42)).toBe(false);
  });
});

describe('isNetworkError', () => {
  it('returns true for BPFError with NETWORK_ERROR code', () => {
    const error = new BPFError('network', ErrorCodes.NETWORK_ERROR);
    expect(isNetworkError(error)).toBe(true);
  });

  it('returns false for BPFError with other codes', () => {
    const error = new BPFError('fail', ErrorCodes.FETCH_FAILED);
    expect(isNetworkError(error)).toBe(false);
  });

  it('returns true for Error with NetworkError', () => {
    expect(isNetworkError(new Error('NetworkError'))).toBe(true);
  });

  it('returns true for Error with Failed to fetch', () => {
    expect(isNetworkError(new Error('Failed to fetch'))).toBe(true);
  });

  it('returns true for Error with Network request failed', () => {
    expect(isNetworkError(new Error('Network request failed'))).toBe(true);
  });

  it('returns false for non-network Error', () => {
    expect(isNetworkError(new Error('permission denied'))).toBe(false);
  });

  it('returns false for non-Error types', () => {
    expect(isNetworkError('string')).toBe(false);
    expect(isNetworkError(null)).toBe(false);
  });
});
