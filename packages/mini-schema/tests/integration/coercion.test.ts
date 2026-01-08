import { describe, expect, it } from 'vitest';
import { s } from '../../src/index.js';

describe('Coercion Integration Tests', () => {
  describe('Form Data Coercion', () => {
    // Simulating form data where everything comes as strings
    const formSchema = s.object({
      name: s.string().min(1),
      age: s.coerce.number(),
      isSubscribed: s.coerce.boolean(),
      budget: s.coerce.number(),
    });

    it('should coerce string values from form', () => {
      const formData = {
        name: 'John Doe',
        age: '30',
        isSubscribed: 'true',
        budget: '1500.50',
      };

      const result = formSchema.safeParse(formData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
        expect(result.data.age).toBe(30);
        expect(result.data.isSubscribed).toBe(true);
        expect(result.data.budget).toBe(1500.5);
      }
    });

    it('should handle false boolean coercion', () => {
      const formData = {
        name: 'John',
        age: '25',
        isSubscribed: 'false',
        budget: '0',
      };

      const result = formSchema.safeParse(formData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isSubscribed).toBe(false);
      }
    });

    it('should reject invalid number string', () => {
      const formData = {
        name: 'John',
        age: 'not-a-number',
        isSubscribed: 'true',
        budget: '100',
      };

      const result = formSchema.safeParse(formData);
      expect(result.success).toBe(false);
    });
  });

  describe('URL Query Parameter Coercion', () => {
    const querySchema = s.object({
      page: s.coerce.number().default(1),
      limit: s.coerce.number().default(20),
      sort: s.string().default('createdAt'),
      ascending: s.coerce.boolean().default(false),
      search: s.string().optional(),
    });

    it('should coerce query parameters', () => {
      const queryParams = {
        page: '3',
        limit: '50',
        sort: 'name',
        ascending: 'true',
        search: 'test',
      };

      const result = querySchema.safeParse(queryParams);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(50);
        expect(result.data.ascending).toBe(true);
      }
    });

    it('should apply defaults for missing params', () => {
      const queryParams = {};

      const result = querySchema.safeParse(queryParams);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sort).toBe('createdAt');
        expect(result.data.ascending).toBe(false);
        expect(result.data.search).toBeUndefined();
      }
    });
  });

  describe('Environment Variable Coercion', () => {
    const envSchema = s.object({
      PORT: s.coerce.number().default(3000),
      DEBUG: s.coerce.boolean().default(false),
      DATABASE_URL: s.string(),
      MAX_CONNECTIONS: s.coerce.number().default(10),
      LOG_LEVEL: s.enum(['debug', 'info', 'warn', 'error'] as const).default('info'),
      CACHE_TTL: s.coerce.number().default(3600),
    });

    it('should coerce environment variables', () => {
      const env = {
        PORT: '8080',
        DEBUG: 'true',
        DATABASE_URL: 'postgres://localhost:5432/mydb',
        MAX_CONNECTIONS: '50',
        LOG_LEVEL: 'debug',
        CACHE_TTL: '7200',
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.PORT).toBe(8080);
        expect(result.data.DEBUG).toBe(true);
        expect(result.data.MAX_CONNECTIONS).toBe(50);
        expect(result.data.CACHE_TTL).toBe(7200);
      }
    });

    it('should apply defaults for minimal env', () => {
      const env = {
        DATABASE_URL: 'postgres://localhost:5432/mydb',
      };

      const result = envSchema.safeParse(env);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.PORT).toBe(3000);
        expect(result.data.DEBUG).toBe(false);
        expect(result.data.MAX_CONNECTIONS).toBe(10);
        expect(result.data.LOG_LEVEL).toBe('info');
        expect(result.data.CACHE_TTL).toBe(3600);
      }
    });
  });

  describe('Mixed Coercion Scenarios', () => {
    it('should handle coercion with nullable', () => {
      const schema = s.object({
        value: s.coerce.number().nullable(),
      });

      expect(schema.safeParse({ value: '42' }).success).toBe(true);
      expect(schema.safeParse({ value: null }).success).toBe(true);

      const result = schema.safeParse({ value: '42' });
      if (result.success) {
        expect(result.data.value).toBe(42);
      }
    });

    it('should handle coercion with optional', () => {
      const schema = s.object({
        value: s.coerce.number().optional(),
      });

      expect(schema.safeParse({}).success).toBe(true);
      expect(schema.safeParse({ value: '42' }).success).toBe(true);

      const result = schema.safeParse({ value: '42' });
      if (result.success) {
        expect(result.data.value).toBe(42);
      }
    });

    it('should handle string coercion for various types', () => {
      const schema = s.object({
        fromNumber: s.coerce.string(),
        fromBoolean: s.coerce.string(),
        fromString: s.coerce.string(),
      });

      const data = {
        fromNumber: 42,
        fromBoolean: true,
        fromString: 'hello',
      };

      const result = schema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fromNumber).toBe('42');
        expect(result.data.fromBoolean).toBe('true');
        expect(result.data.fromString).toBe('hello');
      }
    });
  });

  describe('Coercion with Transforms', () => {
    it('should coerce then transform', () => {
      const schema = s.coerce.number().transform((n) => n * 2);

      const result = schema.safeParse('21');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });

    it('should work with object containing coerced and transformed fields', () => {
      const schema = s.object({
        price: s.coerce.number().transform((n) => Math.round(n * 100) / 100),
        quantity: s.coerce.number().transform((n) => Math.floor(n)),
        total: s.coerce.number().transform((n) => `$${n.toFixed(2)}`),
      });

      const data = {
        price: '29.999',
        quantity: '5',
        total: '149.995',
      };

      const result = schema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price).toBe(30);
        expect(result.data.quantity).toBe(5);
        expect(result.data.total).toBe('$150.00');
      }
    });
  });

  describe('Boolean Coercion Edge Cases', () => {
    it('should coerce 1 and 0 to boolean', () => {
      const schema = s.coerce.boolean();

      expect(schema.safeParse(1).success).toBe(true);
      expect(schema.safeParse(0).success).toBe(true);

      let result = schema.safeParse(1);
      if (result.success) expect(result.data).toBe(true);

      result = schema.safeParse(0);
      if (result.success) expect(result.data).toBe(false);
    });

    it('should coerce string "true" and "false"', () => {
      const schema = s.coerce.boolean();

      let result = schema.safeParse('true');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe(true);

      result = schema.safeParse('false');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe(false);
    });

    it('should coerce truthy/falsy values', () => {
      const schema = s.coerce.boolean();

      // Non-empty string is truthy
      let result = schema.safeParse('hello');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe(true);

      // Empty string is falsy
      result = schema.safeParse('');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe(false);
    });
  });

  describe('Number Coercion Edge Cases', () => {
    it('should coerce numeric strings', () => {
      const schema = s.coerce.number();

      expect(schema.safeParse('42').success).toBe(true);
      expect(schema.safeParse('3.14').success).toBe(true);
      expect(schema.safeParse('-100').success).toBe(true);
      expect(schema.safeParse('0').success).toBe(true);

      const result = schema.safeParse('3.14');
      if (result.success) expect(result.data).toBe(3.14);
    });

    it('should reject non-numeric strings', () => {
      const schema = s.coerce.number();

      expect(schema.safeParse('abc').success).toBe(false);
      expect(schema.safeParse('12abc').success).toBe(false);
      // Note: empty string coerces to 0 in JavaScript (Number('') === 0)
      // This is expected behavior for coercion
    });

    it('should coerce booleans to numbers', () => {
      const schema = s.coerce.number();

      let result = schema.safeParse(true);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe(1);

      result = schema.safeParse(false);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe(0);
    });
  });
});
