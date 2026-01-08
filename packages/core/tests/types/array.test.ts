import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors';
import { s } from '../../src/schema';

describe('ArrayType', () => {
  describe('basic validation', () => {
    it('should accept valid array of strings', () => {
      const schema = s.array(s.string());

      const result = schema.parse(['a', 'b', 'c']);

      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should accept valid array of numbers', () => {
      const schema = s.array(s.number());

      const result = schema.parse([1, 2, 3]);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should accept empty array', () => {
      const schema = s.array(s.string());

      const result = schema.parse([]);

      expect(result).toEqual([]);
    });

    it('should reject non-array', () => {
      const schema = s.array(s.string());

      expect(() => schema.parse('not an array')).toThrow(ValidationError);
      expect(() => schema.parse(123)).toThrow(ValidationError);
      expect(() => schema.parse({})).toThrow(ValidationError);
      expect(() => schema.parse(null)).toThrow(ValidationError);
    });

    it('should reject array with invalid element', () => {
      const schema = s.array(s.string());

      expect(() => schema.parse(['a', 123, 'c'])).toThrow(ValidationError);
    });

    it('should include index in error path', () => {
      const schema = s.array(s.string());

      const result = schema.safeParse(['a', 123, 'c']);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual([1]);
      }
    });
  });

  describe('min()', () => {
    it('should accept array with length >= min', () => {
      const schema = s.array(s.string()).min(2);

      expect(schema.parse(['a', 'b'])).toEqual(['a', 'b']);
      expect(schema.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('should reject array with length < min', () => {
      const schema = s.array(s.string()).min(2);

      expect(() => schema.parse(['a'])).toThrow(ValidationError);
      expect(() => schema.parse([])).toThrow(ValidationError);
    });

    it('should use custom error message', () => {
      const schema = s.array(s.string()).min(2, { message: 'Need at least 2' });

      const result = schema.safeParse(['a']);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Need at least 2');
      }
    });
  });

  describe('max()', () => {
    it('should accept array with length <= max', () => {
      const schema = s.array(s.string()).max(2);

      expect(schema.parse(['a'])).toEqual(['a']);
      expect(schema.parse(['a', 'b'])).toEqual(['a', 'b']);
    });

    it('should reject array with length > max', () => {
      const schema = s.array(s.string()).max(2);

      expect(() => schema.parse(['a', 'b', 'c'])).toThrow(ValidationError);
    });
  });

  describe('length()', () => {
    it('should accept array with exact length', () => {
      const schema = s.array(s.string()).length(3);

      expect(schema.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('should reject array with different length', () => {
      const schema = s.array(s.string()).length(3);

      expect(() => schema.parse(['a', 'b'])).toThrow(ValidationError);
      expect(() => schema.parse(['a', 'b', 'c', 'd'])).toThrow(ValidationError);
    });
  });

  describe('nonempty()', () => {
    it('should accept non-empty array', () => {
      const schema = s.array(s.string()).nonempty();

      expect(schema.parse(['a'])).toEqual(['a']);
    });

    it('should reject empty array', () => {
      const schema = s.array(s.string()).nonempty();

      expect(() => schema.parse([])).toThrow(ValidationError);
    });
  });

  describe('nested arrays', () => {
    it('should validate array of arrays', () => {
      const schema = s.array(s.array(s.number()));

      const result = schema.parse([[1, 2], [3, 4], [5]]);

      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should report correct path for nested error', () => {
      const schema = s.array(s.array(s.number()));

      const result = schema.safeParse([[1, 2], [3, 'four'], [5]]);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual([1, 1]);
      }
    });
  });

  describe('array of objects', () => {
    it('should validate array of objects', () => {
      const schema = s.array(
        s.object({
          name: s.string(),
          age: s.number(),
        }),
      );

      const result = schema.parse([
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ]);

      expect(result).toEqual([
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ]);
    });

    it('should report correct path for object property error', () => {
      const schema = s.array(
        s.object({
          name: s.string(),
        }),
      );

      const result = schema.safeParse([{ name: 'John' }, { name: 123 }]);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual([1, 'name']);
      }
    });
  });

  describe('element property', () => {
    it('should expose the element schema', () => {
      const stringSchema = s.string();
      const schema = s.array(stringSchema);

      expect(schema.element).toBe(stringSchema);
    });
  });
});
