/**
 * Tests for configValidation utility
 */

import { validateBPFConfiguration, formatValidationErrors, ValidationError } from '../../utils/configValidation';

describe('validateBPFConfiguration', () => {
  describe('root level validation', () => {
    it('rejects null config', () => {
      const result = validateBPFConfiguration(null);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('root');
    });

    it('rejects undefined config', () => {
      const result = validateBPFConfiguration(undefined);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toBe('Configuration must be an object');
    });

    it('rejects string config', () => {
      const result = validateBPFConfiguration('not an object');
      expect(result.isValid).toBe(false);
    });

    it('rejects number config', () => {
      const result = validateBPFConfiguration(42);
      expect(result.isValid).toBe(false);
    });
  });

  describe('bpfs array validation', () => {
    it('rejects missing bpfs field', () => {
      const result = validateBPFConfiguration({});
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('bpfs');
      expect(result.errors[0].message).toContain('missing');
    });

    it('rejects non-array bpfs', () => {
      const result = validateBPFConfiguration({ bpfs: 'not an array' });
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toBe('Must be an array');
    });

    it('rejects empty bpfs array', () => {
      const result = validateBPFConfiguration({ bpfs: [] });
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('at least one');
    });

    it('rejects more than 10 BPF definitions', () => {
      const bpfs = Array.from({ length: 11 }, (_, i) => ({
        bpfEntitySchemaName: `entity${i}`,
        lookupFieldSchemaName: `field${i}`,
      }));
      const result = validateBPFConfiguration({ bpfs });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Cannot exceed 10'))).toBe(true);
    });
  });

  describe('BPF definition validation', () => {
    it('rejects non-object BPF definitions', () => {
      const result = validateBPFConfiguration({ bpfs: ['not an object'] });
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toBe('Must be an object');
    });

    it('rejects null BPF definitions', () => {
      const result = validateBPFConfiguration({ bpfs: [null] });
      expect(result.isValid).toBe(false);
    });

    it('rejects missing bpfEntitySchemaName', () => {
      const result = validateBPFConfiguration({
        bpfs: [{ lookupFieldSchemaName: 'field_name' }],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field.includes('bpfEntitySchemaName'))).toBe(true);
    });

    it('rejects non-string bpfEntitySchemaName', () => {
      const result = validateBPFConfiguration({
        bpfs: [{ bpfEntitySchemaName: 123, lookupFieldSchemaName: 'field_name' }],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Must be a string'))).toBe(true);
    });

    it('rejects invalid entity name format', () => {
      const result = validateBPFConfiguration({
        bpfs: [{ bpfEntitySchemaName: '123invalid', lookupFieldSchemaName: 'field_name' }],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Invalid entity name'))).toBe(true);
    });

    it('rejects missing lookupFieldSchemaName', () => {
      const result = validateBPFConfiguration({
        bpfs: [{ bpfEntitySchemaName: 'valid_entity' }],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field.includes('lookupFieldSchemaName'))).toBe(true);
    });

    it('rejects non-string lookupFieldSchemaName', () => {
      const result = validateBPFConfiguration({
        bpfs: [{ bpfEntitySchemaName: 'valid_entity', lookupFieldSchemaName: 42 }],
      });
      expect(result.isValid).toBe(false);
    });

    it('rejects invalid lookup field name format', () => {
      const result = validateBPFConfiguration({
        bpfs: [{ bpfEntitySchemaName: 'valid_entity', lookupFieldSchemaName: '123invalid' }],
      });
      expect(result.isValid).toBe(false);
    });

    it('accepts underscore-prefixed lookup field names', () => {
      const result = validateBPFConfiguration({
        bpfs: [{ bpfEntitySchemaName: 'opportunitysalesprocess', lookupFieldSchemaName: '_opportunityid_value' }],
      });
      expect(result.isValid).toBe(true);
    });

    it('flags unexpected properties', () => {
      const result = validateBPFConfiguration({
        bpfs: [{
          bpfEntitySchemaName: 'valid_entity',
          lookupFieldSchemaName: '_valid_field',
          extraProp: 'should not be here',
        }],
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Unexpected properties'))).toBe(true);
    });
  });

  describe('valid configurations', () => {
    it('accepts a valid single BPF configuration', () => {
      const result = validateBPFConfiguration({
        bpfs: [{
          bpfEntitySchemaName: 'opportunitysalesprocess',
          lookupFieldSchemaName: '_opportunityid_value',
        }],
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.config).toBeDefined();
    });

    it('accepts multiple valid BPF definitions', () => {
      const result = validateBPFConfiguration({
        bpfs: [
          { bpfEntitySchemaName: 'entityA', lookupFieldSchemaName: '_fieldA_value' },
          { bpfEntitySchemaName: 'entityB', lookupFieldSchemaName: '_fieldB_value' },
        ],
      });
      expect(result.isValid).toBe(true);
      expect(result.config?.bpfs).toHaveLength(2);
    });
  });
});

describe('formatValidationErrors', () => {
  it('returns empty string for no errors', () => {
    expect(formatValidationErrors([])).toBe('');
  });

  it('returns simple format for single error', () => {
    const errors: ValidationError[] = [{ field: 'bpfs', message: 'Required' }];
    expect(formatValidationErrors(errors)).toBe('bpfs: Required');
  });

  it('returns bullet format for multiple errors', () => {
    const errors: ValidationError[] = [
      { field: 'field1', message: 'Error 1' },
      { field: 'field2', message: 'Error 2' },
    ];
    const result = formatValidationErrors(errors);
    expect(result).toContain('• field1: Error 1');
    expect(result).toContain('• field2: Error 2');
  });
});
