import { describe, expect, it } from 'vitest';
import { fromJsonSchema, s, toJsonSchema } from '../../src/index.js';

describe('JSON Schema Round-Trip Integration Tests', () => {
  describe('Primitive Types Round-Trip', () => {
    it('should round-trip string schema', () => {
      const original = s.string().min(1).max(100);
      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      expect(jsonSchema.type).toBe('string');
      expect(jsonSchema.minLength).toBe(1);
      expect(jsonSchema.maxLength).toBe(100);

      // Test the reconstructed schema works
      expect(reconstructed.safeParse('hello').success).toBe(true);
      expect(reconstructed.safeParse('').success).toBe(false);
    });

    it('should round-trip number schema', () => {
      const original = s.number().min(0).max(100);
      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      expect(jsonSchema.type).toBe('number');
      expect(jsonSchema.minimum).toBe(0);
      expect(jsonSchema.maximum).toBe(100);

      expect(reconstructed.safeParse(50).success).toBe(true);
      expect(reconstructed.safeParse(-1).success).toBe(false);
      expect(reconstructed.safeParse(101).success).toBe(false);
    });

    it('should round-trip integer schema', () => {
      const original = s.number().int();
      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      expect(jsonSchema.type).toBe('integer');

      expect(reconstructed.safeParse(42).success).toBe(true);
      expect(reconstructed.safeParse(3.14).success).toBe(false);
    });

    it('should round-trip boolean schema', () => {
      const original = s.boolean();
      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      expect(jsonSchema.type).toBe('boolean');

      expect(reconstructed.safeParse(true).success).toBe(true);
      expect(reconstructed.safeParse(false).success).toBe(true);
      expect(reconstructed.safeParse('true').success).toBe(false);
    });
  });

  describe('String Formats Round-Trip', () => {
    it('should round-trip email schema', () => {
      const original = s.string().email();
      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      expect(jsonSchema.format).toBe('email');

      expect(reconstructed.safeParse('user@example.com').success).toBe(true);
      expect(reconstructed.safeParse('invalid').success).toBe(false);
    });

    it('should round-trip uuid schema', () => {
      const original = s.string().uuid();
      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      expect(jsonSchema.format).toBe('uuid');

      expect(reconstructed.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true);
      expect(reconstructed.safeParse('not-a-uuid').success).toBe(false);
    });

    it('should round-trip datetime schema', () => {
      const original = s.string().datetime();
      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      expect(jsonSchema.format).toBe('date-time');

      expect(reconstructed.safeParse('2024-01-15T10:30:00Z').success).toBe(true);
      expect(reconstructed.safeParse('not-a-date').success).toBe(false);
    });
  });

  describe('Object Schema Round-Trip', () => {
    it('should round-trip simple object schema', () => {
      const original = s.object({
        name: s.string(),
        age: s.number(),
      });

      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      expect(jsonSchema.type).toBe('object');
      expect(jsonSchema.properties).toHaveProperty('name');
      expect(jsonSchema.properties).toHaveProperty('age');
      expect(jsonSchema.required).toContain('name');
      expect(jsonSchema.required).toContain('age');

      expect(reconstructed.safeParse({ name: 'John', age: 30 }).success).toBe(true);
      expect(reconstructed.safeParse({ name: 'John' }).success).toBe(false);
    });

    it('should round-trip object with optional fields', () => {
      const original = s.object({
        name: s.string(),
        nickname: s.string().optional(),
      });

      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      expect(jsonSchema.required).toContain('name');
      expect(jsonSchema.required).not.toContain('nickname');

      expect(reconstructed.safeParse({ name: 'John' }).success).toBe(true);
      expect(reconstructed.safeParse({ name: 'John', nickname: 'Johnny' }).success).toBe(true);
    });

    it('should round-trip nested object schema', () => {
      const original = s.object({
        user: s.object({
          name: s.string(),
          email: s.string().email(),
        }),
        settings: s.object({
          darkMode: s.boolean(),
        }),
      });

      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      const validData = {
        user: { name: 'John', email: 'john@example.com' },
        settings: { darkMode: true },
      };

      expect(reconstructed.safeParse(validData).success).toBe(true);
    });
  });

  describe('Array Schema Round-Trip', () => {
    it('should round-trip string array schema', () => {
      const original = s.array(s.string());
      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      expect(jsonSchema.type).toBe('array');
      expect(jsonSchema.items).toEqual({ type: 'string' });

      expect(reconstructed.safeParse(['a', 'b', 'c']).success).toBe(true);
      expect(reconstructed.safeParse([1, 2, 3]).success).toBe(false);
    });

    it('should round-trip array with constraints', () => {
      const original = s.array(s.number()).min(1).max(5);
      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      expect(jsonSchema.minItems).toBe(1);
      expect(jsonSchema.maxItems).toBe(5);

      expect(reconstructed.safeParse([1, 2, 3]).success).toBe(true);
      expect(reconstructed.safeParse([]).success).toBe(false);
    });

    it('should round-trip array of objects', () => {
      const original = s.array(
        s.object({
          id: s.number(),
          name: s.string(),
        }),
      );

      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      const validData = [
        { id: 1, name: 'First' },
        { id: 2, name: 'Second' },
      ];

      expect(reconstructed.safeParse(validData).success).toBe(true);
    });
  });

  describe('Enum and Literal Round-Trip', () => {
    it('should round-trip enum schema', () => {
      const original = s.enum(['active', 'pending', 'inactive'] as const);
      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      expect(jsonSchema.enum).toEqual(['active', 'pending', 'inactive']);

      expect(reconstructed.safeParse('active').success).toBe(true);
      expect(reconstructed.safeParse('unknown').success).toBe(false);
    });

    it('should round-trip literal schema', () => {
      const original = s.literal('fixed');
      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      expect(jsonSchema.const).toBe('fixed');

      expect(reconstructed.safeParse('fixed').success).toBe(true);
      expect(reconstructed.safeParse('other').success).toBe(false);
    });
  });

  describe('Nullable Types Round-Trip', () => {
    it('should round-trip nullable string', () => {
      const original = s.string().nullable();
      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      expect(jsonSchema.type).toContain('string');
      expect(jsonSchema.type).toContain('null');

      expect(reconstructed.safeParse('hello').success).toBe(true);
      expect(reconstructed.safeParse(null).success).toBe(true);
    });

    it('should round-trip nullable number', () => {
      const original = s.number().nullable();
      const jsonSchema = toJsonSchema(original);
      const reconstructed = fromJsonSchema(jsonSchema);

      expect(reconstructed.safeParse(42).success).toBe(true);
      expect(reconstructed.safeParse(null).success).toBe(true);
    });
  });

  describe('Complex Schema Round-Trip', () => {
    it('should round-trip a real-world API schema', () => {
      const original = s.object({
        id: s.string().uuid(),
        name: s.string().min(1).max(100),
        email: s.string().email(),
        age: s.number().int().min(0).max(150).optional(),
        role: s.enum(['admin', 'user', 'guest'] as const),
        tags: s.array(s.string()),
        metadata: s
          .object({
            createdAt: s.string().datetime(),
            updatedAt: s.string().datetime().optional(),
          })
          .optional(),
      });

      const jsonSchema = toJsonSchema(original, {
        includeSchema: true,
        title: 'User',
        description: 'A user in the system',
      });

      expect(jsonSchema.$schema).toBeDefined();
      expect(jsonSchema.title).toBe('User');
      expect(jsonSchema.description).toBe('A user in the system');

      const reconstructed = fromJsonSchema(jsonSchema);

      const validUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        role: 'admin',
        tags: ['developer', 'typescript'],
        metadata: {
          createdAt: '2024-01-15T10:00:00Z',
        },
      };

      expect(reconstructed.safeParse(validUser).success).toBe(true);
    });
  });

  describe('JSON Schema Generation Options', () => {
    it('should include $schema when requested', () => {
      const schema = s.string();
      const jsonSchema = toJsonSchema(schema, { includeSchema: true });

      expect(jsonSchema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
    });

    it('should include $id when provided', () => {
      const schema = s.string();
      const jsonSchema = toJsonSchema(schema, {
        $id: 'https://example.com/schemas/string',
      });

      expect(jsonSchema.$id).toBe('https://example.com/schemas/string');
    });

    it('should include title and description when provided', () => {
      const schema = s.object({ name: s.string() });
      const jsonSchema = toJsonSchema(schema, {
        title: 'Person',
        description: 'A person schema',
      });

      expect(jsonSchema.title).toBe('Person');
      expect(jsonSchema.description).toBe('A person schema');
    });
  });
});
