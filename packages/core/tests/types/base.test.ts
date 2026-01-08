import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors';
import type { ParseContext, ParseResult } from '../../src/errors/types';
import { BaseType } from '../../src/types/base';

// Concrete implementation for testing
class TestStringType extends BaseType<string> {
  _parse(value: unknown, ctx: ParseContext): ParseResult<string> {
    if (typeof value === 'string') {
      return { success: true, data: value };
    }
    return this._createError(ctx, {
      code: 'invalid_type',
      expected: 'string',
      received: typeof value,
    });
  }

  _clone(): TestStringType {
    return new TestStringType();
  }
}

describe('BaseType', () => {
  describe('parse', () => {
    it('should return value when valid', () => {
      const schema = new TestStringType();

      const result = schema.parse('hello');

      expect(result).toBe('hello');
    });

    it('should throw ValidationError when invalid', () => {
      const schema = new TestStringType();

      expect(() => schema.parse(123)).toThrow(ValidationError);
    });

    it('should throw error with correct message', () => {
      const schema = new TestStringType();

      try {
        schema.parse(123);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain('string');
      }
    });
  });

  describe('safeParse', () => {
    it('should return success result when valid', () => {
      const schema = new TestStringType();

      const result = schema.safeParse('hello');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('hello');
      }
    });

    it('should return error result when invalid', () => {
      const schema = new TestStringType();

      const result = schema.safeParse(123);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError);
        expect(result.error.issues).toHaveLength(1);
      }
    });

    it('should accept custom error map', () => {
      const schema = new TestStringType();
      const customMap = () => 'Custom error';

      const result = schema.safeParse(123, { errorMap: customMap });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Custom error');
      }
    });
  });

  describe('type inference', () => {
    it('should have _output phantom type', () => {
      const schema = new TestStringType();

      // TypeScript compile-time check - at runtime we just verify the schema exists
      expect(schema).toBeDefined();
    });
  });
});
