import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors';
import { s } from '../../src/schema';

describe('ObjectType', () => {
  describe('basic validation', () => {
    it('should accept valid object', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number(),
      });

      const result = schema.parse({ name: 'John', age: 30 });

      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should reject non-object', () => {
      const schema = s.object({
        name: s.string(),
      });

      expect(() => schema.parse('not an object')).toThrow(ValidationError);
      expect(() => schema.parse(123)).toThrow(ValidationError);
      expect(() => schema.parse(null)).toThrow(ValidationError);
      expect(() => schema.parse(undefined)).toThrow(ValidationError);
    });

    it('should reject array', () => {
      const schema = s.object({
        name: s.string(),
      });

      expect(() => schema.parse([])).toThrow(ValidationError);
    });

    it('should validate nested properties', () => {
      const schema = s.object({
        name: s.string().min(2),
        age: s.number().positive(),
      });

      expect(() => schema.parse({ name: 'J', age: 30 })).toThrow(ValidationError);
      expect(() => schema.parse({ name: 'John', age: -5 })).toThrow(ValidationError);
    });

    it('should include path in error', () => {
      const schema = s.object({
        user: s.object({
          name: s.string(),
        }),
      });

      const result = schema.safeParse({ user: { name: 123 } });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(['user', 'name']);
      }
    });
  });

  describe('missing properties', () => {
    it('should reject missing required property', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number(),
      });

      expect(() => schema.parse({ name: 'John' })).toThrow(ValidationError);
    });

    it('should accept missing optional property', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number().optional(),
      });

      const result = schema.parse({ name: 'John' });

      expect(result).toEqual({ name: 'John' });
    });

    it('should use default value for missing property', () => {
      const schema = s.object({
        name: s.string(),
        role: s.string().default('user'),
      });

      const result = schema.parse({ name: 'John' });

      expect(result).toEqual({ name: 'John', role: 'user' });
    });
  });

  describe('extra properties', () => {
    it('should strip unknown keys by default', () => {
      const schema = s.object({
        name: s.string(),
      });

      const result = schema.parse({ name: 'John', extra: 'value' });

      expect(result).toEqual({ name: 'John' });
      expect(result).not.toHaveProperty('extra');
    });

    it('should reject unknown keys with strict()', () => {
      const schema = s
        .object({
          name: s.string(),
        })
        .strict();

      expect(() => schema.parse({ name: 'John', extra: 'value' })).toThrow(ValidationError);
    });

    it('should pass through unknown keys with passthrough()', () => {
      const schema = s
        .object({
          name: s.string(),
        })
        .passthrough();

      const result = schema.parse({ name: 'John', extra: 'value' });

      expect(result).toEqual({ name: 'John', extra: 'value' });
    });
  });

  describe('nested objects', () => {
    it('should validate deeply nested objects', () => {
      const schema = s.object({
        user: s.object({
          profile: s.object({
            name: s.string(),
            age: s.number(),
          }),
        }),
      });

      const result = schema.parse({
        user: {
          profile: {
            name: 'John',
            age: 30,
          },
        },
      });

      expect(result).toEqual({
        user: {
          profile: {
            name: 'John',
            age: 30,
          },
        },
      });
    });

    it('should report correct path for nested errors', () => {
      const schema = s.object({
        level1: s.object({
          level2: s.object({
            value: s.number(),
          }),
        }),
      });

      const result = schema.safeParse({
        level1: {
          level2: {
            value: 'not a number',
          },
        },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(['level1', 'level2', 'value']);
      }
    });
  });

  describe('extend()', () => {
    it('should extend object schema with new properties', () => {
      const baseSchema = s.object({
        name: s.string(),
      });

      const extendedSchema = baseSchema.extend({
        age: s.number(),
      });

      const result = extendedSchema.parse({ name: 'John', age: 30 });

      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should override existing properties', () => {
      const baseSchema = s.object({
        name: s.string(),
        age: s.number(),
      });

      const extendedSchema = baseSchema.extend({
        age: s.string(), // override number with string
      });

      const result = extendedSchema.parse({ name: 'John', age: 'thirty' });

      expect(result).toEqual({ name: 'John', age: 'thirty' });
    });
  });

  describe('pick()', () => {
    it('should pick specified properties', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number(),
        email: s.string(),
      });

      const pickedSchema = schema.pick('name', 'email');

      const result = pickedSchema.parse({
        name: 'John',
        email: 'john@example.com',
      });

      expect(result).toEqual({ name: 'John', email: 'john@example.com' });
    });

    it('should reject non-picked properties as required', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number(),
      });

      const pickedSchema = schema.pick('name');

      // age is not in the picked schema, so it should be stripped
      const result = pickedSchema.parse({ name: 'John', age: 30 });

      expect(result).toEqual({ name: 'John' });
    });
  });

  describe('omit()', () => {
    it('should omit specified properties', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number(),
        password: s.string(),
      });

      const safeSchema = schema.omit('password');

      const result = safeSchema.parse({ name: 'John', age: 30 });

      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should strip omitted properties from input', () => {
      const schema = s.object({
        name: s.string(),
        password: s.string(),
      });

      const safeSchema = schema.omit('password');

      const result = safeSchema.parse({ name: 'John', password: 'secret' });

      expect(result).toEqual({ name: 'John' });
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('partial()', () => {
    it('should make all properties optional', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number(),
      });

      const partialSchema = schema.partial();

      expect(partialSchema.parse({})).toEqual({});
      expect(partialSchema.parse({ name: 'John' })).toEqual({ name: 'John' });
      expect(partialSchema.parse({ age: 30 })).toEqual({ age: 30 });
    });
  });

  describe('required()', () => {
    it('should make all properties required', () => {
      const schema = s.object({
        name: s.string().optional(),
        age: s.number().optional(),
      });

      const requiredSchema = schema.required();

      expect(() => requiredSchema.parse({})).toThrow(ValidationError);
      expect(() => requiredSchema.parse({ name: 'John' })).toThrow(ValidationError);
      expect(requiredSchema.parse({ name: 'John', age: 30 })).toEqual({
        name: 'John',
        age: 30,
      });
    });
  });

  describe('shape property', () => {
    it('should expose the shape', () => {
      const schema = s.object({
        name: s.string(),
        age: s.number(),
      });

      expect(schema.shape).toHaveProperty('name');
      expect(schema.shape).toHaveProperty('age');
    });
  });

  describe('empty object', () => {
    it('should accept empty schema', () => {
      const schema = s.object({});

      expect(schema.parse({})).toEqual({});
    });

    it('should strip all properties with empty schema', () => {
      const schema = s.object({});

      expect(schema.parse({ name: 'John' })).toEqual({});
    });
  });
});
