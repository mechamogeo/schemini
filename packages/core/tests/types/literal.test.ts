import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors';
import { s } from '../../src/schema';

describe('LiteralType', () => {
  describe('string literal', () => {
    it('should accept exact string value', () => {
      const schema = s.literal('active');

      expect(schema.parse('active')).toBe('active');
    });

    it('should reject different string', () => {
      const schema = s.literal('active');

      expect(() => schema.parse('inactive')).toThrow(ValidationError);
    });

    it('should reject similar but different case', () => {
      const schema = s.literal('active');

      expect(() => schema.parse('Active')).toThrow(ValidationError);
    });
  });

  describe('number literal', () => {
    it('should accept exact number value', () => {
      const schema = s.literal(42);

      expect(schema.parse(42)).toBe(42);
    });

    it('should reject different number', () => {
      const schema = s.literal(42);

      expect(() => schema.parse(43)).toThrow(ValidationError);
    });

    it('should reject string representation', () => {
      const schema = s.literal(42);

      expect(() => schema.parse('42')).toThrow(ValidationError);
    });
  });

  describe('boolean literal', () => {
    it('should accept true literal', () => {
      const schema = s.literal(true);

      expect(schema.parse(true)).toBe(true);
    });

    it('should accept false literal', () => {
      const schema = s.literal(false);

      expect(schema.parse(false)).toBe(false);
    });

    it('should reject opposite boolean', () => {
      const schema = s.literal(true);

      expect(() => schema.parse(false)).toThrow(ValidationError);
    });
  });

  describe('null literal', () => {
    it('should accept null', () => {
      const schema = s.literal(null);

      expect(schema.parse(null)).toBe(null);
    });

    it('should reject undefined', () => {
      const schema = s.literal(null);

      expect(() => schema.parse(undefined)).toThrow(ValidationError);
    });
  });

  describe('undefined literal', () => {
    it('should accept undefined', () => {
      const schema = s.literal(undefined);

      expect(schema.parse(undefined)).toBe(undefined);
    });

    it('should reject null', () => {
      const schema = s.literal(undefined);

      expect(() => schema.parse(null)).toThrow(ValidationError);
    });
  });

  describe('error messages', () => {
    it('should show expected value in error', () => {
      const schema = s.literal('active');

      const result = schema.safeParse('inactive');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe('invalid_literal');
      }
    });
  });
});
