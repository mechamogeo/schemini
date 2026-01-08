import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors';
import { s } from '../../src/schema';

describe('EnumType', () => {
  describe('string enum', () => {
    it('should accept valid enum value', () => {
      const schema = s.enum(['pending', 'active', 'inactive']);

      expect(schema.parse('active')).toBe('active');
    });

    it('should accept first enum value', () => {
      const schema = s.enum(['pending', 'active', 'inactive']);

      expect(schema.parse('pending')).toBe('pending');
    });

    it('should accept last enum value', () => {
      const schema = s.enum(['pending', 'active', 'inactive']);

      expect(schema.parse('inactive')).toBe('inactive');
    });

    it('should reject invalid string', () => {
      const schema = s.enum(['pending', 'active', 'inactive']);

      expect(() => schema.parse('deleted')).toThrow(ValidationError);
    });

    it('should reject similar but different case', () => {
      const schema = s.enum(['pending', 'active', 'inactive']);

      expect(() => schema.parse('Active')).toThrow(ValidationError);
    });
  });

  describe('number enum', () => {
    it('should accept valid number enum value', () => {
      const schema = s.enum([1, 2, 3]);

      expect(schema.parse(2)).toBe(2);
    });

    it('should reject invalid number', () => {
      const schema = s.enum([1, 2, 3]);

      expect(() => schema.parse(4)).toThrow(ValidationError);
    });
  });

  describe('mixed enum', () => {
    it('should accept string from mixed enum', () => {
      const schema = s.enum(['auto', 0, 1]);

      expect(schema.parse('auto')).toBe('auto');
    });

    it('should accept number from mixed enum', () => {
      const schema = s.enum(['auto', 0, 1]);

      expect(schema.parse(0)).toBe(0);
    });

    it('should reject value not in enum', () => {
      const schema = s.enum(['auto', 0, 1]);

      expect(() => schema.parse(2)).toThrow(ValidationError);
    });
  });

  describe('edge cases', () => {
    it('should work with single value enum', () => {
      const schema = s.enum(['only']);

      expect(schema.parse('only')).toBe('only');
    });

    it('should reject null', () => {
      const schema = s.enum(['a', 'b']);

      expect(() => schema.parse(null)).toThrow(ValidationError);
    });

    it('should reject undefined', () => {
      const schema = s.enum(['a', 'b']);

      expect(() => schema.parse(undefined)).toThrow(ValidationError);
    });
  });

  describe('error messages', () => {
    it('should show valid options in error', () => {
      const schema = s.enum(['pending', 'active', 'inactive']);

      const result = schema.safeParse('deleted');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe('invalid_enum');
        expect(result.error.issues[0]?.options).toEqual(['pending', 'active', 'inactive']);
      }
    });
  });

  describe('options property', () => {
    it('should expose enum options', () => {
      const schema = s.enum(['pending', 'active', 'inactive']);

      expect(schema.options).toEqual(['pending', 'active', 'inactive']);
    });
  });
});
