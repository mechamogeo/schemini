import { describe, expect, it } from 'vitest';
import { JSON_SCHEMA_DRAFT, type JsonSchema, fromJsonSchema, s, toJsonSchema } from '../../src';

describe('JSON Schema', () => {
  describe('toJsonSchema', () => {
    describe('primitive types', () => {
      it('should convert string schema', () => {
        const schema = s.string();
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema).toEqual({ type: 'string' });
      });

      it('should convert string with constraints', () => {
        const schema = s.string().min(1).max(100);
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema).toEqual({
          type: 'string',
          minLength: 1,
          maxLength: 100,
        });
      });

      it('should convert string with pattern', () => {
        const schema = s.string().pattern(/^[a-z]+$/);
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema).toEqual({
          type: 'string',
          pattern: '^[a-z]+$',
        });
      });

      it('should convert email format', () => {
        const schema = s.string().email();
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema.type).toBe('string');
        expect(jsonSchema.format).toBe('email');
      });

      it('should convert uuid format', () => {
        const schema = s.string().uuid();
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema.format).toBe('uuid');
      });

      it('should convert date format', () => {
        const schema = s.string().date();
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema.format).toBe('date');
      });

      it('should convert datetime format', () => {
        const schema = s.string().datetime();
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema.format).toBe('date-time');
      });

      it('should convert number schema', () => {
        const schema = s.number();
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema).toEqual({ type: 'number' });
      });

      it('should convert integer schema', () => {
        const schema = s.number().int();
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema).toEqual({ type: 'integer' });
      });

      it('should convert number with constraints', () => {
        const schema = s.number().min(0).max(100);
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema).toEqual({
          type: 'number',
          minimum: 0,
          maximum: 100,
        });
      });

      it('should convert boolean schema', () => {
        const schema = s.boolean();
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema).toEqual({ type: 'boolean' });
      });
    });

    describe('literal and enum types', () => {
      it('should convert literal string', () => {
        const schema = s.literal('admin');
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema).toEqual({ const: 'admin' });
      });

      it('should convert literal number', () => {
        const schema = s.literal(42);
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema).toEqual({ const: 42 });
      });

      it('should convert enum', () => {
        const schema = s.enum(['a', 'b', 'c'] as const);
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema).toEqual({ enum: ['a', 'b', 'c'] });
      });
    });

    describe('object types', () => {
      it('should convert simple object', () => {
        const schema = s.object({
          name: s.string(),
          age: s.number(),
        });
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema).toEqual({
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
          required: ['name', 'age'],
        });
      });

      it('should handle optional fields', () => {
        const schema = s.object({
          name: s.string(),
          nickname: s.string().optional(),
        });
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema.required).toEqual(['name']);
        expect(jsonSchema.properties).toHaveProperty('nickname');
      });

      it('should handle default values', () => {
        const schema = s.object({
          name: s.string(),
          role: s.string().default('user'),
        });
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema.properties?.role?.default).toBe('user');
        expect(jsonSchema.required).toEqual(['name']);
      });

      it('should handle nested objects', () => {
        const schema = s.object({
          user: s.object({
            name: s.string(),
          }),
        });
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema.properties?.user).toEqual({
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
        });
      });
    });

    describe('array types', () => {
      it('should convert array schema', () => {
        const schema = s.array(s.string());
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema).toEqual({
          type: 'array',
          items: { type: 'string' },
        });
      });

      it('should convert array with constraints', () => {
        const schema = s.array(s.number()).min(1).max(10);
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema).toEqual({
          type: 'array',
          items: { type: 'number' },
          minItems: 1,
          maxItems: 10,
        });
      });

      it('should convert array of objects', () => {
        const schema = s.array(
          s.object({
            id: s.number(),
          }),
        );
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema.items).toEqual({
          type: 'object',
          properties: { id: { type: 'number' } },
          required: ['id'],
        });
      });
    });

    describe('union types', () => {
      it('should convert union to anyOf', () => {
        const schema = s.union([s.string(), s.number()] as const);
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema).toEqual({
          anyOf: [{ type: 'string' }, { type: 'number' }],
        });
      });
    });

    describe('nullable and optional', () => {
      it('should convert nullable to type array with null', () => {
        const schema = s.string().nullable();
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema.type).toEqual(['string', 'null']);
      });

      it('should convert nullish to type array with null', () => {
        const schema = s.string().nullish();
        const jsonSchema = toJsonSchema(schema);

        expect(jsonSchema.type).toEqual(['string', 'null']);
      });
    });

    describe('options', () => {
      it('should include $schema when requested', () => {
        const schema = s.string();
        const jsonSchema = toJsonSchema(schema, { includeSchema: true });

        expect(jsonSchema.$schema).toBe(JSON_SCHEMA_DRAFT);
      });

      it('should include $id when provided', () => {
        const schema = s.string();
        const jsonSchema = toJsonSchema(schema, {
          $id: 'https://example.com/schema',
        });

        expect(jsonSchema.$id).toBe('https://example.com/schema');
      });

      it('should include title when provided', () => {
        const schema = s.string();
        const jsonSchema = toJsonSchema(schema, { title: 'My Schema' });

        expect(jsonSchema.title).toBe('My Schema');
      });

      it('should include description when provided', () => {
        const schema = s.string();
        const jsonSchema = toJsonSchema(schema, {
          description: 'A description',
        });

        expect(jsonSchema.description).toBe('A description');
      });
    });
  });

  describe('fromJsonSchema', () => {
    describe('primitive types', () => {
      it('should convert string type', () => {
        const jsonSchema: JsonSchema = { type: 'string' };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse('hello')).toBe('hello');
        expect(() => schema.parse(123)).toThrow();
      });

      it('should convert string with constraints', () => {
        const jsonSchema: JsonSchema = {
          type: 'string',
          minLength: 2,
          maxLength: 10,
        };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse('hello')).toBe('hello');
        expect(() => schema.parse('a')).toThrow();
        expect(() => schema.parse('a'.repeat(20))).toThrow();
      });

      it('should convert string with pattern', () => {
        const jsonSchema: JsonSchema = {
          type: 'string',
          pattern: '^[a-z]+$',
        };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse('hello')).toBe('hello');
        expect(() => schema.parse('Hello')).toThrow();
      });

      it('should convert email format', () => {
        const jsonSchema: JsonSchema = {
          type: 'string',
          format: 'email',
        };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse('test@example.com')).toBe('test@example.com');
        expect(() => schema.parse('invalid')).toThrow();
      });

      it('should convert number type', () => {
        const jsonSchema: JsonSchema = { type: 'number' };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse(42)).toBe(42);
        expect(schema.parse(3.14)).toBe(3.14);
        expect(() => schema.parse('42')).toThrow();
      });

      it('should convert integer type', () => {
        const jsonSchema: JsonSchema = { type: 'integer' };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse(42)).toBe(42);
        expect(() => schema.parse(3.14)).toThrow();
      });

      it('should convert number with constraints', () => {
        const jsonSchema: JsonSchema = {
          type: 'number',
          minimum: 0,
          maximum: 100,
        };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse(50)).toBe(50);
        expect(() => schema.parse(-1)).toThrow();
        expect(() => schema.parse(101)).toThrow();
      });

      it('should convert boolean type', () => {
        const jsonSchema: JsonSchema = { type: 'boolean' };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse(true)).toBe(true);
        expect(schema.parse(false)).toBe(false);
        expect(() => schema.parse('true')).toThrow();
      });
    });

    describe('const and enum', () => {
      it('should convert const to literal', () => {
        const jsonSchema: JsonSchema = { const: 'admin' };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse('admin')).toBe('admin');
        expect(() => schema.parse('user')).toThrow();
      });

      it('should convert enum', () => {
        const jsonSchema: JsonSchema = { enum: ['a', 'b', 'c'] };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse('a')).toBe('a');
        expect(schema.parse('b')).toBe('b');
        expect(() => schema.parse('d')).toThrow();
      });
    });

    describe('object types', () => {
      it('should convert object type', () => {
        const jsonSchema: JsonSchema = {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
          required: ['name', 'age'],
        };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse({ name: 'John', age: 30 })).toEqual({
          name: 'John',
          age: 30,
        });
      });

      it('should handle optional properties', () => {
        const jsonSchema: JsonSchema = {
          type: 'object',
          properties: {
            name: { type: 'string' },
            nickname: { type: 'string' },
          },
          required: ['name'],
        };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse({ name: 'John' })).toEqual({ name: 'John' });
        expect(schema.parse({ name: 'John', nickname: 'Johnny' })).toEqual({
          name: 'John',
          nickname: 'Johnny',
        });
      });
    });

    describe('array types', () => {
      it('should convert array type', () => {
        const jsonSchema: JsonSchema = {
          type: 'array',
          items: { type: 'string' },
        };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse(['a', 'b'])).toEqual(['a', 'b']);
        expect(() => schema.parse([1, 2])).toThrow();
      });

      it('should convert array with constraints', () => {
        const jsonSchema: JsonSchema = {
          type: 'array',
          items: { type: 'number' },
          minItems: 1,
          maxItems: 3,
        };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse([1, 2])).toEqual([1, 2]);
        expect(() => schema.parse([])).toThrow();
        expect(() => schema.parse([1, 2, 3, 4])).toThrow();
      });
    });

    describe('union types', () => {
      it('should convert anyOf to union', () => {
        const jsonSchema: JsonSchema = {
          anyOf: [{ type: 'string' }, { type: 'number' }],
        };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse('hello')).toBe('hello');
        expect(schema.parse(42)).toBe(42);
        expect(() => schema.parse(true)).toThrow();
      });

      it('should convert oneOf to union', () => {
        const jsonSchema: JsonSchema = {
          oneOf: [{ type: 'string' }, { type: 'number' }],
        };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse('hello')).toBe('hello');
        expect(schema.parse(42)).toBe(42);
      });

      it('should handle type array with null', () => {
        const jsonSchema: JsonSchema = {
          type: ['string', 'null'],
        };
        const schema = fromJsonSchema(jsonSchema);

        expect(schema.parse('hello')).toBe('hello');
        expect(schema.parse(null)).toBe(null);
      });
    });
  });

  describe('roundtrip', () => {
    it('should roundtrip simple schema', () => {
      const original = s.object({
        name: s.string().min(1),
        age: s.number().min(0),
        active: s.boolean(),
      });

      const jsonSchema = toJsonSchema(original);
      const restored = fromJsonSchema(jsonSchema);

      // Test that restored schema works the same
      const testData = { name: 'John', age: 30, active: true };
      expect(restored.parse(testData)).toEqual(original.parse(testData));
    });
  });
});
