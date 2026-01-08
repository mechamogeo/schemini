import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors';
import { s } from '../../src/schema';

describe('NumberType', () => {
  describe('basic validation', () => {
    it('should accept valid number', () => {
      const schema = s.number();

      expect(schema.parse(42)).toBe(42);
    });

    it('should accept zero', () => {
      const schema = s.number();

      expect(schema.parse(0)).toBe(0);
    });

    it('should accept negative number', () => {
      const schema = s.number();

      expect(schema.parse(-42)).toBe(-42);
    });

    it('should accept float', () => {
      const schema = s.number();

      expect(schema.parse(3.14)).toBe(3.14);
    });

    it('should reject string', () => {
      const schema = s.number();

      expect(() => schema.parse('42')).toThrow(ValidationError);
    });

    it('should reject null', () => {
      const schema = s.number();

      expect(() => schema.parse(null)).toThrow(ValidationError);
    });

    it('should reject undefined', () => {
      const schema = s.number();

      expect(() => schema.parse(undefined)).toThrow(ValidationError);
    });

    it('should reject NaN', () => {
      const schema = s.number();

      expect(() => schema.parse(Number.NaN)).toThrow(ValidationError);
    });

    it('should reject Infinity', () => {
      const schema = s.number();

      expect(() => schema.parse(Number.POSITIVE_INFINITY)).toThrow(ValidationError);
      expect(() => schema.parse(Number.NEGATIVE_INFINITY)).toThrow(ValidationError);
    });
  });

  describe('int validation', () => {
    it('should accept integer', () => {
      const schema = s.number().int();

      expect(schema.parse(42)).toBe(42);
    });

    it('should reject float', () => {
      const schema = s.number().int();

      expect(() => schema.parse(3.14)).toThrow(ValidationError);
    });

    it('should accept negative integer', () => {
      const schema = s.number().int();

      expect(schema.parse(-42)).toBe(-42);
    });

    it('should use custom error message', () => {
      const schema = s.number().int({ message: 'Must be integer' });

      const result = schema.safeParse(3.14);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Must be integer');
      }
    });
  });

  describe('min validation', () => {
    it('should accept number equal to min', () => {
      const schema = s.number().min(5);

      expect(schema.parse(5)).toBe(5);
    });

    it('should accept number greater than min', () => {
      const schema = s.number().min(5);

      expect(schema.parse(10)).toBe(10);
    });

    it('should reject number less than min', () => {
      const schema = s.number().min(5);

      expect(() => schema.parse(3)).toThrow(ValidationError);
    });

    it('should use custom error message', () => {
      const schema = s.number().min(5, { message: 'Too small!' });

      const result = schema.safeParse(3);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Too small!');
      }
    });
  });

  describe('max validation', () => {
    it('should accept number equal to max', () => {
      const schema = s.number().max(10);

      expect(schema.parse(10)).toBe(10);
    });

    it('should accept number less than max', () => {
      const schema = s.number().max(10);

      expect(schema.parse(5)).toBe(5);
    });

    it('should reject number greater than max', () => {
      const schema = s.number().max(10);

      expect(() => schema.parse(15)).toThrow(ValidationError);
    });

    it('should use custom error message', () => {
      const schema = s.number().max(10, { message: 'Too big!' });

      const result = schema.safeParse(15);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Too big!');
      }
    });
  });

  describe('positive validation', () => {
    it('should accept positive number', () => {
      const schema = s.number().positive();

      expect(schema.parse(1)).toBe(1);
    });

    it('should reject zero', () => {
      const schema = s.number().positive();

      expect(() => schema.parse(0)).toThrow(ValidationError);
    });

    it('should reject negative number', () => {
      const schema = s.number().positive();

      expect(() => schema.parse(-1)).toThrow(ValidationError);
    });
  });

  describe('negative validation', () => {
    it('should accept negative number', () => {
      const schema = s.number().negative();

      expect(schema.parse(-1)).toBe(-1);
    });

    it('should reject zero', () => {
      const schema = s.number().negative();

      expect(() => schema.parse(0)).toThrow(ValidationError);
    });

    it('should reject positive number', () => {
      const schema = s.number().negative();

      expect(() => schema.parse(1)).toThrow(ValidationError);
    });
  });

  describe('nonnegative validation', () => {
    it('should accept zero', () => {
      const schema = s.number().nonnegative();

      expect(schema.parse(0)).toBe(0);
    });

    it('should accept positive number', () => {
      const schema = s.number().nonnegative();

      expect(schema.parse(1)).toBe(1);
    });

    it('should reject negative number', () => {
      const schema = s.number().nonnegative();

      expect(() => schema.parse(-1)).toThrow(ValidationError);
    });
  });

  describe('chaining validators', () => {
    it('should chain int and min/max', () => {
      const schema = s.number().int().min(0).max(100);

      expect(schema.parse(50)).toBe(50);
      expect(() => schema.parse(3.14)).toThrow(ValidationError);
      expect(() => schema.parse(-1)).toThrow(ValidationError);
      expect(() => schema.parse(101)).toThrow(ValidationError);
    });
  });
});
