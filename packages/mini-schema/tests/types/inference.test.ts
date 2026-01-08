import { describe, expect, expectTypeOf, it } from 'vitest';
import { type Infer, s } from '../../src';

describe('Type Inference', () => {
  describe('Infer type utility', () => {
    describe('primitive types', () => {
      it('should infer string type', () => {
        const schema = s.string();
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<string>();

        // Runtime verification
        const value: Result = 'hello';
        expect(schema.parse(value)).toBe('hello');
      });

      it('should infer number type', () => {
        const schema = s.number();
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<number>();

        const value: Result = 42;
        expect(schema.parse(value)).toBe(42);
      });

      it('should infer boolean type', () => {
        const schema = s.boolean();
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<boolean>();

        const value: Result = true;
        expect(schema.parse(value)).toBe(true);
      });
    });

    describe('literal types', () => {
      it('should infer string literal type', () => {
        const schema = s.literal('admin');
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<'admin'>();

        const value: Result = 'admin';
        expect(schema.parse(value)).toBe('admin');
      });

      it('should infer number literal type', () => {
        const schema = s.literal(42);
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<42>();

        const value: Result = 42;
        expect(schema.parse(value)).toBe(42);
      });

      it('should infer boolean literal type', () => {
        const schema = s.literal(true);
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<true>();

        const value: Result = true;
        expect(schema.parse(value)).toBe(true);
      });
    });

    describe('enum types', () => {
      it('should infer enum type', () => {
        const schema = s.enum(['admin', 'user', 'guest'] as const);
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<'admin' | 'user' | 'guest'>();

        const value: Result = 'admin';
        expect(schema.parse(value)).toBe('admin');
      });

      it('should infer mixed enum type', () => {
        const schema = s.enum([1, 2, 'three'] as const);
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<1 | 2 | 'three'>();

        const value: Result = 'three';
        expect(schema.parse(value)).toBe('three');
      });
    });

    describe('object types', () => {
      it('should infer simple object type', () => {
        const schema = s.object({
          name: s.string(),
          age: s.number(),
        });
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<{ name: string; age: number }>();

        const value: Result = { name: 'John', age: 30 };
        expect(schema.parse(value)).toEqual(value);
      });

      it('should infer nested object type', () => {
        const schema = s.object({
          user: s.object({
            name: s.string(),
          }),
          active: s.boolean(),
        });
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<{
          user: { name: string };
          active: boolean;
        }>();

        const value: Result = { user: { name: 'John' }, active: true };
        expect(schema.parse(value)).toEqual(value);
      });

      it('should infer object with optional fields', () => {
        const schema = s.object({
          name: s.string(),
          nickname: s.string().optional(),
        });
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<{
          name: string;
          nickname?: string | undefined;
        }>();

        const value: Result = { name: 'John' };
        expect(schema.parse(value)).toEqual(value);
      });

      it('should infer partial object type', () => {
        const schema = s
          .object({
            name: s.string(),
            age: s.number(),
          })
          .partial();
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<{
          name?: string | undefined;
          age?: number | undefined;
        }>();

        const value: Result = { name: 'John' };
        expect(schema.parse(value)).toEqual(value);
      });
    });

    describe('array types', () => {
      it('should infer array of primitives', () => {
        const schema = s.array(s.string());
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<string[]>();

        const value: Result = ['a', 'b', 'c'];
        expect(schema.parse(value)).toEqual(value);
      });

      it('should infer array of objects', () => {
        const schema = s.array(
          s.object({
            id: s.number(),
            name: s.string(),
          }),
        );
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<{ id: number; name: string }[]>();

        const value: Result = [{ id: 1, name: 'John' }];
        expect(schema.parse(value)).toEqual(value);
      });
    });

    describe('union types', () => {
      it('should infer union of primitives', () => {
        const schema = s.union([s.string(), s.number()] as const);
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<string | number>();

        const strValue: Result = 'hello';
        const numValue: Result = 42;
        expect(schema.parse(strValue)).toBe('hello');
        expect(schema.parse(numValue)).toBe(42);
      });

      it('should infer union with literals', () => {
        const schema = s.union([s.literal('a'), s.literal('b'), s.literal(1)] as const);
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<'a' | 'b' | 1>();

        const value: Result = 'a';
        expect(schema.parse(value)).toBe('a');
      });
    });

    describe('modifier types', () => {
      it('should infer optional type', () => {
        const schema = s.string().optional();
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<string | undefined>();

        expect(schema.parse(undefined)).toBe(undefined);
        expect(schema.parse('hello')).toBe('hello');
      });

      it('should infer nullable type', () => {
        const schema = s.string().nullable();
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<string | null>();

        expect(schema.parse(null)).toBe(null);
        expect(schema.parse('hello')).toBe('hello');
      });

      it('should infer nullish type', () => {
        const schema = s.string().nullish();
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<string | null | undefined>();

        expect(schema.parse(null)).toBe(null);
        expect(schema.parse(undefined)).toBe(undefined);
        expect(schema.parse('hello')).toBe('hello');
      });

      it('should infer default type', () => {
        const schema = s.string().default('default');
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<string>();

        expect(schema.parse(undefined)).toBe('default');
        expect(schema.parse('hello')).toBe('hello');
      });

      it('should infer transform type', () => {
        const schema = s.string().transform((s) => s.length);
        type Result = Infer<typeof schema>;

        expectTypeOf<Result>().toEqualTypeOf<number>();

        expect(schema.parse('hello')).toBe(5);
      });
    });
  });

  describe('s.infer<> shorthand', () => {
    it('should work as s.infer<typeof schema>', () => {
      const userSchema = s.object({
        name: s.string(),
        email: s.string().email(),
        age: s.number().optional(),
      });

      type User = s.infer<typeof userSchema>;

      expectTypeOf<User>().toEqualTypeOf<{
        name: string;
        email: string;
        age?: number | undefined;
      }>();

      const user: User = { name: 'John', email: 'john@example.com' };
      expect(userSchema.parse(user)).toEqual(user);
    });
  });

  describe('s.input<> for transforms', () => {
    it('should infer input type for transformed schemas', () => {
      const schema = s.string().transform((s) => Number.parseInt(s, 10));

      type Input = s.input<typeof schema>;
      type Output = s.infer<typeof schema>;

      // Input is string, output is number
      expectTypeOf<Input>().toEqualTypeOf<string>();
      expectTypeOf<Output>().toEqualTypeOf<number>();

      expect(schema.parse('42')).toBe(42);
    });
  });

  describe('complex nested inference', () => {
    it('should infer complex nested schemas', () => {
      const addressSchema = s.object({
        street: s.string(),
        city: s.string(),
        zip: s.string(),
      });

      const userSchema = s.object({
        id: s.number(),
        name: s.string(),
        email: s.string().email(),
        role: s.enum(['admin', 'user'] as const),
        address: addressSchema.optional(),
        tags: s.array(s.string()),
        metadata: s
          .object({
            createdAt: s.string(),
            updatedAt: s.string().optional(),
          })
          .optional(),
      });

      type User = s.infer<typeof userSchema>;

      // Type should be correctly inferred
      expectTypeOf<User>().toMatchTypeOf<{
        id: number;
        name: string;
        email: string;
        role: 'admin' | 'user';
        address?: { street: string; city: string; zip: string } | undefined;
        tags: string[];
        metadata?: { createdAt: string; updatedAt?: string | undefined } | undefined;
      }>();

      const user: User = {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        role: 'admin',
        tags: ['developer'],
      };

      expect(userSchema.parse(user)).toEqual(user);
    });
  });
});
