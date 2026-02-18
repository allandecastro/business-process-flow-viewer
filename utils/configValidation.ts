import type { IBPFConfiguration } from '../types';
import { isValidEntityName } from './sanitize';

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  config?: IBPFConfiguration;
}

/**
 * Validate BPF configuration structure and content
 *
 * Ensures the configuration JSON matches the expected schema and
 * contains valid entity/field names to prevent injection attacks.
 *
 * @param config - Configuration object to validate (unknown type)
 * @returns Validation result with errors or validated config
 *
 * @example
 * ```typescript
 * const result = validateBPFConfiguration(parsedJson);
 * if (result.isValid) {
 *   this.bpfConfig = result.config;
 * } else {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function validateBPFConfiguration(config: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // Type guard: must be an object
  if (!config || typeof config !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'root', message: 'Configuration must be an object' }],
    };
  }

  const cfg = config as Record<string, unknown>;

  // Validate bpfs array exists
  if (!('bpfs' in cfg)) {
    errors.push({ field: 'bpfs', message: 'Required field "bpfs" is missing' });
    return { isValid: false, errors };
  }

  // Validate bpfs is an array
  if (!Array.isArray(cfg.bpfs)) {
    errors.push({ field: 'bpfs', message: 'Must be an array' });
    return { isValid: false, errors };
  }

  // Validate array is not empty
  if (cfg.bpfs.length === 0) {
    errors.push({
      field: 'bpfs',
      message: 'Must contain at least one BPF definition',
    });
  }

  // Validate reasonable array size (prevent DOS)
  if (cfg.bpfs.length > 10) {
    errors.push({
      field: 'bpfs',
      message: 'Cannot exceed 10 BPF definitions',
    });
  }

  // Validate each BPF definition
  cfg.bpfs.forEach((bpf: unknown, index: number) => {
    // Validate it's an object
    if (!bpf || typeof bpf !== 'object') {
      errors.push({
        field: `bpfs[${index}]`,
        message: 'Must be an object',
      });
      return;
    }

    const entry = bpf as Record<string, unknown>;

    // Validate bpfEntitySchemaName
    if (!entry.bpfEntitySchemaName) {
      errors.push({
        field: `bpfs[${index}].bpfEntitySchemaName`,
        message: 'Required field is missing',
      });
    } else if (typeof entry.bpfEntitySchemaName !== 'string') {
      errors.push({
        field: `bpfs[${index}].bpfEntitySchemaName`,
        message: 'Must be a string',
      });
    } else if (!isValidEntityName(entry.bpfEntitySchemaName)) {
      errors.push({
        field: `bpfs[${index}].bpfEntitySchemaName`,
        message:
          'Invalid entity name format. Must start with letter and contain only alphanumeric characters and underscores.',
      });
    }

    // Validate lookupFieldSchemaName
    if (!entry.lookupFieldSchemaName) {
      errors.push({
        field: `bpfs[${index}].lookupFieldSchemaName`,
        message: 'Required field is missing',
      });
    } else if (typeof entry.lookupFieldSchemaName !== 'string') {
      errors.push({
        field: `bpfs[${index}].lookupFieldSchemaName`,
        message: 'Must be a string',
      });
    } else if (!isValidEntityName(entry.lookupFieldSchemaName)) {
      errors.push({
        field: `bpfs[${index}].lookupFieldSchemaName`,
        message:
          'Invalid field name format. Must start with letter and contain only alphanumeric characters and underscores.',
      });
    }

    // Check for unexpected properties (security)
    const allowedProps = ['bpfEntitySchemaName', 'lookupFieldSchemaName'];
    const actualProps = Object.keys(entry);
    const unexpectedProps = actualProps.filter((p) => !allowedProps.includes(p));

    if (unexpectedProps.length > 0) {
      errors.push({
        field: `bpfs[${index}]`,
        message: `Unexpected properties: ${unexpectedProps.join(', ')}`,
      });
    }
  });

  // Return validation result
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    config: cfg as unknown as IBPFConfiguration,
  };
}

/**
 * Format validation errors into a user-friendly message
 *
 * @param errors - Array of validation errors
 * @returns Formatted error message
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';

  if (errors.length === 1) {
    return `${errors[0].field}: ${errors[0].message}`;
  }

  return errors.map((e) => `• ${e.field}: ${e.message}`).join('\n');
}
