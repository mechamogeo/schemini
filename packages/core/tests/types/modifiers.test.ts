import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors';
import { s } from '../../src/schema';

describe('Modifiers', () => {
  describe('optional()', () => {
    it('should accept undefined for optional string', () => {
      const schema = s.string().optional();

      expect(schema.parse(undefined)).toBe(undefined);
    });

    it('should still accept valid string for optional', () => {
      const schema = s.string().optional();

      expect(schema.parse('hello')).toBe('hello');
    });

    it('should still reject null for optional', () => {
      const schema = s.string().optional();

      expect(() => schema.parse(null)).toThrow(ValidationError);
    });

    it('should still reject invalid type for optional', () => {
      const schema = s.string().optional();

      expect(() => schema.parse(123)).toThrow(ValidationError);
    });

    it('should work with number', () => {
      const schema = s.number().optional();

      expect(schema.parse(undefined)).toBe(undefined);
      expect(schema.parse(42)).toBe(42);
    });

    it('should work with validators', () => {
      const schema = s.string().min(3).optional();

      expect(schema.parse(undefined)).toBe(undefined);
      expect(schema.parse('hello')).toBe('hello');
      expect(() => schema.parse('ab')).toThrow(ValidationError);
    });
  });

  describe('nullable()', () => {
    it('should accept null for nullable string', () => {
      const schema = s.string().nullable();

      expect(schema.parse(null)).toBe(null);
    });

    it('should still accept valid string for nullable', () => {
      const schema = s.string().nullable();

      expect(schema.parse('hello')).toBe('hello');
    });

    it('should still reject undefined for nullable', () => {
      const schema = s.string().nullable();

      expect(() => schema.parse(undefined)).toThrow(ValidationError);
    });

    it('should still reject invalid type for nullable', () => {
      const schema = s.string().nullable();

      expect(() => schema.parse(123)).toThrow(ValidationError);
    });

    it('should work with number', () => {
      const schema = s.number().nullable();

      expect(schema.parse(null)).toBe(null);
      expect(schema.parse(42)).toBe(42);
    });
  });

  describe('nullish()', () => {
    it('should accept null for nullish string', () => {
      const schema = s.string().nullish();

      expect(schema.parse(null)).toBe(null);
    });

    it('should accept undefined for nullish string', () => {
      const schema = s.string().nullish();

      expect(schema.parse(undefined)).toBe(undefined);
    });

    it('should still accept valid string for nullish', () => {
      const schema = s.string().nullish();

      expect(schema.parse('hello')).toBe('hello');
    });

    it('should still reject invalid type for nullish', () => {
      const schema = s.string().nullish();

      expect(() => schema.parse(123)).toThrow(ValidationError);
    });
  });

  describe('default()', () => {
    it('should use default value for undefined', () => {
      const schema = s.string().default('default');

      expect(schema.parse(undefined)).toBe('default');
    });

    it('should not use default for valid value', () => {
      const schema = s.string().default('default');

      expect(schema.parse('hello')).toBe('hello');
    });

    it('should not use default for null', () => {
      const schema = s.string().default('default');

      expect(() => schema.parse(null)).toThrow(ValidationError);
    });

    it('should work with number', () => {
      const schema = s.number().default(0);

      expect(schema.parse(undefined)).toBe(0);
      expect(schema.parse(42)).toBe(42);
    });

    it('should work with function default', () => {
      let counter = 0;
      const schema = s.number().default(() => ++counter);

      expect(schema.parse(undefined)).toBe(1);
      expect(schema.parse(undefined)).toBe(2);
      expect(schema.parse(10)).toBe(10);
    });
  });

  describe('transform()', () => {
    it('should transform valid value', () => {
      const schema = s.string().transform((val) => val.toUpperCase());

      expect(schema.parse('hello')).toBe('HELLO');
    });

    it('should reject invalid value before transform', () => {
      const schema = s.string().transform((val) => val.toUpperCase());

      expect(() => schema.parse(123)).toThrow(ValidationError);
    });

    it('should chain transforms', () => {
      const schema = s
        .string()
        .transform((val) => val.trim())
        .transform((val) => val.toUpperCase());

      expect(schema.parse('  hello  ')).toBe('HELLO');
    });

    it('should work with number', () => {
      const schema = s.number().transform((val) => val * 2);

      expect(schema.parse(21)).toBe(42);
    });

    it('should transform after validation', () => {
      const schema = s
        .string()
        .min(3)
        .transform((val) => val.length);

      expect(schema.parse('hello')).toBe(5);
      expect(() => schema.parse('ab')).toThrow(ValidationError);
    });

    it('should work with optional', () => {
      const schema = s
        .string()
        .optional()
        .transform((val) => (val === undefined ? 'none' : val.toUpperCase()));

      expect(schema.parse(undefined)).toBe('none');
      expect(schema.parse('hello')).toBe('HELLO');
    });
  });

  describe('coerce', () => {
    it('should coerce to string', () => {
      const schema = s.coerce.string();

      expect(schema.parse(123)).toBe('123');
      expect(schema.parse(true)).toBe('true');
      expect(schema.parse('hello')).toBe('hello');
    });

    it('should coerce to number', () => {
      const schema = s.coerce.number();

      expect(schema.parse('42')).toBe(42);
      expect(schema.parse('3.14')).toBe(3.14);
      expect(schema.parse(42)).toBe(42);
    });

    it('should reject invalid coercion to number', () => {
      const schema = s.coerce.number();

      expect(() => schema.parse('not a number')).toThrow(ValidationError);
    });

    it('should coerce to boolean', () => {
      const schema = s.coerce.boolean();

      expect(schema.parse('true')).toBe(true);
      expect(schema.parse('false')).toBe(false);
      expect(schema.parse(1)).toBe(true);
      expect(schema.parse(0)).toBe(false);
      expect(schema.parse(true)).toBe(true);
    });
  });
});
