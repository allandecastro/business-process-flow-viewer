/**
 * Security utilities for sanitizing user input and validating data
 *
 * These utilities help prevent common security vulnerabilities:
 * - XSS (Cross-Site Scripting) attacks
 * - SQL Injection (via OData queries)
 * - Invalid data formats
 */

/**
 * Sanitize text for use in HTML attributes
 *
 * Removes potentially dangerous characters and limits length to prevent attacks.
 *
 * @param text - Text to sanitize
 * @returns Sanitized text safe for use in attributes
 */
export function sanitizeText(text: string): string {
  if (!text) return '';

  return (
    text
      .replace(/[<>'"]/g, '') // Remove HTML-sensitive characters
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .trim()
      .substring(0, 500) // Limit length to prevent buffer overflow
  );
}

/**
 * Validate entity name format
 *
 * Dataverse entity names must:
 * - Start with a letter
 * - Contain only alphanumeric characters and underscores
 * - Be between 1-128 characters
 *
 * @param name - Entity name to validate
 * @returns True if valid entity name format
 */
export function isValidEntityName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  return /^[a-z][a-z0-9_]{0,127}$/i.test(name);
}

/**
 * Validate Dataverse field/column name format
 *
 * Lookup field schema names in Dataverse start with underscore
 * (e.g. _opportunityid_value, _leadid_value).
 *
 * @param name - Field name to validate
 * @returns True if valid field name format
 */
export function isValidFieldName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  return /^[a-z_][a-z0-9_]{0,127}$/i.test(name);
}

/**
 * Validate GUID format
 *
 * Dataverse uses GUIDs for record IDs. This validates the standard GUID format:
 * xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 *
 * @param guid - GUID string to validate
 * @returns True if valid GUID format
 */
export function isValidGuid(guid: string): boolean {
  if (!guid || typeof guid !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(guid);
}

/**
 * Validate hex color code format
 *
 * Validates standard 6-digit hex color codes: #RRGGBB
 *
 * @param color - Color string to validate
 * @returns True if valid hex color format
 */
export function isValidHexColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false;
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Sanitize and validate a URL
 *
 * Only allows http and https protocols to prevent javascript: URLs
 *
 * @param url - URL to validate
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url;
    }
  } catch {
    // Invalid URL
  }

  return '';
}

/**
 * Escape special characters for OData queries
 *
 * Prevents injection attacks in OData filter queries
 *
 * @param value - Value to escape
 * @returns Escaped value safe for OData queries
 */
export function escapeODataValue(value: string): string {
  if (typeof value !== 'string') {
    return '';
  }
  if (!value) return '';

  return value
    .replace(/'/g, "''") // Escape single quotes
    .replace(/\\/g, '\\\\'); // Escape backslashes
}
