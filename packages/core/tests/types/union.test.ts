import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors';
import { s } from '../../src/schema';

describe('UnionType', () => {
  describe('basic validation', () => {
    it('should accept first type in union', () => {
      const schema = s.union([s.string(), s.number()]);

      expect(schema.parse('hello')).toBe('hello');
    });

    it('should accept second type in union', () => {
      const schema = s.union([s.string(), s.number()]);

      expect(schema.parse(42)).toBe(42);
    });

    it('should reject value not matching any type', () => {
      const schema = s.union([s.string(), s.number()]);

      expect(() => schema.parse(true)).toThrow(ValidationError);
      expect(() => schema.parse(null)).toThrow(ValidationError);
      expect(() => schema.parse({})).toThrow(ValidationError);
    });
  });

  describe('multiple types', () => {
    it('should work with three types', () => {
      const schema = s.union([s.string(), s.number(), s.boolean()]);

      expect(schema.parse('hello')).toBe('hello');
      expect(schema.parse(42)).toBe(42);
      expect(schema.parse(true)).toBe(true);
    });

    it('should reject value not in union', () => {
      const schema = s.union([s.string(), s.number(), s.boolean()]);

      expect(() => schema.parse(null)).toThrow(ValidationError);
    });
  });

  describe('literal unions', () => {
    it('should work with literal types', () => {
      const schema = s.union([s.literal('pending'), s.literal('active'), s.literal('inactive')]);

      expect(schema.parse('pending')).toBe('pending');
      expect(schema.parse('active')).toBe('active');
      expect(() => schema.parse('deleted')).toThrow(ValidationError);
    });
  });

  describe('object unions (discriminated)', () => {
    it('should work with object types', () => {
      const schema = s.union([
        s.object({ type: s.literal('a'), value: s.string() }),
        s.object({ type: s.literal('b'), value: s.number() }),
      ]);

      expect(schema.parse({ type: 'a', value: 'hello' })).toEqual({
        type: 'a',
        value: 'hello',
      });
      expect(schema.parse({ type: 'b', value: 42 })).toEqual({
        type: 'b',
        value: 42,
      });
    });

    it('should reject invalid discriminated union', () => {
      const schema = s.union([
        s.object({ type: s.literal('a'), value: s.string() }),
        s.object({ type: s.literal('b'), value: s.number() }),
      ]);

      expect(() => schema.parse({ type: 'c', value: 'x' })).toThrow(ValidationError);
    });
  });

  describe('nullable shorthand', () => {
    it('should work like nullable', () => {
      const schema = s.union([s.string(), s.literal(null)]);

      expect(schema.parse('hello')).toBe('hello');
      expect(schema.parse(null)).toBe(null);
    });
  });

  describe('error messages', () => {
    it('should show invalid_union error code', () => {
      const schema = s.union([s.string(), s.number()]);

      const result = schema.safeParse(true);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.code).toBe('invalid_union');
      }
    });
  });

  describe('options property', () => {
    it('should expose the union options', () => {
      const stringSchema = s.string();
      const numberSchema = s.number();
      const schema = s.union([stringSchema, numberSchema]);

      expect(schema.options).toHaveLength(2);
      expect(schema.options[0]).toBe(stringSchema);
      expect(schema.options[1]).toBe(numberSchema);
    });
  });
});
