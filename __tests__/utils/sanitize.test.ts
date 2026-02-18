/**
 * Tests for sanitize utility
 */

import {
  sanitizeText,
  isValidEntityName,
  isValidGuid,
  isValidHexColor,
  sanitizeUrl,
  escapeODataValue,
} from '../../utils/sanitize';

describe('sanitizeText', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeText('')).toBe('');
  });

  it('returns empty string for null-like input', () => {
    // @ts-expect-error testing null input
    expect(sanitizeText(null)).toBe('');
    // @ts-expect-error testing undefined input
    expect(sanitizeText(undefined)).toBe('');
  });

  it('removes HTML-sensitive characters', () => {
    expect(sanitizeText('<script>alert("xss")</script>')).toBe('scriptalert(xss)/script');
  });

  it('removes control characters', () => {
    expect(sanitizeText('hello\x00world')).toBe('helloworld');
    expect(sanitizeText('test\x1F')).toBe('test');
  });

  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('limits length to 500 characters', () => {
    const longString = 'a'.repeat(600);
    expect(sanitizeText(longString).length).toBe(500);
  });

  it('preserves safe text', () => {
    expect(sanitizeText('Hello World 123')).toBe('Hello World 123');
  });
});

describe('isValidEntityName', () => {
  it('returns true for valid entity names', () => {
    expect(isValidEntityName('account')).toBe(true);
    expect(isValidEntityName('custom_entity')).toBe(true);
    expect(isValidEntityName('new_myEntity123')).toBe(true);
    expect(isValidEntityName('a')).toBe(true);
  });

  it('returns false for names starting with number', () => {
    expect(isValidEntityName('123entity')).toBe(false);
  });

  it('returns false for names starting with underscore', () => {
    expect(isValidEntityName('_entity')).toBe(false);
  });

  it('returns false for names with special characters', () => {
    expect(isValidEntityName('entity-name')).toBe(false);
    expect(isValidEntityName('entity.name')).toBe(false);
    expect(isValidEntityName('entity name')).toBe(false);
  });

  it('returns false for empty input', () => {
    expect(isValidEntityName('')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    // @ts-expect-error testing null input
    expect(isValidEntityName(null)).toBe(false);
    // @ts-expect-error testing undefined input
    expect(isValidEntityName(undefined)).toBe(false);
  });

  it('returns false for non-string input', () => {
    // @ts-expect-error testing number input
    expect(isValidEntityName(123)).toBe(false);
  });
});

describe('isValidGuid', () => {
  it('returns true for valid GUIDs', () => {
    expect(isValidGuid('12345678-1234-1234-1234-123456789abc')).toBe(true);
    expect(isValidGuid('ABCDEF00-1234-5678-9ABC-DEF012345678')).toBe(true);
  });

  it('returns false for invalid GUIDs', () => {
    expect(isValidGuid('not-a-guid')).toBe(false);
    expect(isValidGuid('12345678-1234-1234-1234')).toBe(false);
    expect(isValidGuid('12345678-1234-1234-1234-123456789ABCG')).toBe(false);
  });

  it('returns false for empty/null input', () => {
    expect(isValidGuid('')).toBe(false);
    // @ts-expect-error testing null input
    expect(isValidGuid(null)).toBe(false);
    // @ts-expect-error testing undefined input
    expect(isValidGuid(undefined)).toBe(false);
  });
});

describe('isValidHexColor', () => {
  it('returns true for valid hex colors', () => {
    expect(isValidHexColor('#FF0000')).toBe(true);
    expect(isValidHexColor('#00ff00')).toBe(true);
    expect(isValidHexColor('#123ABC')).toBe(true);
  });

  it('returns false for invalid hex colors', () => {
    expect(isValidHexColor('FF0000')).toBe(false); // Missing #
    expect(isValidHexColor('#FFF')).toBe(false); // Too short
    expect(isValidHexColor('#GGGGGG')).toBe(false); // Invalid chars
  });

  it('returns false for empty/null input', () => {
    expect(isValidHexColor('')).toBe(false);
    // @ts-expect-error testing null input
    expect(isValidHexColor(null)).toBe(false);
  });
});

describe('sanitizeUrl', () => {
  it('accepts http URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('accepts https URLs', () => {
    expect(sanitizeUrl('https://example.com/path')).toBe('https://example.com/path');
  });

  it('rejects javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
  });

  it('rejects data: URLs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('rejects ftp: URLs', () => {
    expect(sanitizeUrl('ftp://example.com')).toBe('');
  });

  it('returns empty for invalid URLs', () => {
    expect(sanitizeUrl('not a url')).toBe('');
  });

  it('returns empty for empty/null input', () => {
    expect(sanitizeUrl('')).toBe('');
    // @ts-expect-error testing null input
    expect(sanitizeUrl(null)).toBe('');
    // @ts-expect-error testing undefined input
    expect(sanitizeUrl(undefined)).toBe('');
  });
});

describe('escapeODataValue', () => {
  it('escapes single quotes', () => {
    expect(escapeODataValue("test'value")).toBe("test''value");
  });

  it('escapes backslashes', () => {
    expect(escapeODataValue('test\\value')).toBe('test\\\\value');
  });

  it('escapes both single quotes and backslashes', () => {
    // Input: it\'s  -> backslash becomes \\ and quote becomes ''
    expect(escapeODataValue("it\\'s")).toBe("it\\\\''s");
  });

  it('returns empty for empty string', () => {
    expect(escapeODataValue('')).toBe('');
  });

  it('warns and returns empty for null/undefined input', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // @ts-expect-error testing null input
    expect(escapeODataValue(null)).toBe('');
    // @ts-expect-error testing undefined input
    expect(escapeODataValue(undefined)).toBe('');

    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledWith(
      '[BPFViewer] escapeODataValue called with non-string input:',
      'object'
    );
    expect(warnSpy).toHaveBeenCalledWith(
      '[BPFViewer] escapeODataValue called with non-string input:',
      'undefined'
    );

    warnSpy.mockRestore();
  });

  it('returns unchanged for safe values', () => {
    expect(escapeODataValue('safe value 123')).toBe('safe value 123');
  });
});
