import { describe, expect, it } from 'vitest';
import { s } from '../../src/index.js';

describe('Real-World Schema Integration Tests', () => {
  describe('User Registration Form', () => {
    const userRegistrationSchema = s.object({
      email: s.string().email(),
      password: s.string().min(8).max(100),
      confirmPassword: s.string().min(8),
      name: s.string().min(2).max(50),
      age: s.number().int().min(13).max(120).optional(),
      phone: s.string().phone().optional(),
      acceptTerms: s.boolean(),
    });

    it('should validate a valid registration', () => {
      const validData = {
        email: 'user@example.com',
        password: 'securePassword123',
        confirmPassword: 'securePassword123',
        name: 'John Doe',
        age: 25,
        acceptTerms: true,
      };

      const result = userRegistrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
        expect(result.data.name).toBe('John Doe');
      }
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'securePassword123',
        confirmPassword: 'securePassword123',
        name: 'John Doe',
        acceptTerms: true,
      };

      const result = userRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(['email']);
      }
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'short',
        confirmPassword: 'short',
        name: 'John Doe',
        acceptTerms: true,
      };

      const result = userRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(['password']);
      }
    });

    it('should allow optional fields to be omitted', () => {
      const validData = {
        email: 'user@example.com',
        password: 'securePassword123',
        confirmPassword: 'securePassword123',
        name: 'John Doe',
        acceptTerms: true,
      };

      const result = userRegistrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.age).toBeUndefined();
        expect(result.data.phone).toBeUndefined();
      }
    });
  });

  describe('E-commerce Product Schema', () => {
    const productSchema = s.object({
      id: s.string().uuid(),
      name: s.string().min(1).max(200),
      description: s.string().max(5000).optional(),
      price: s.number().min(0),
      currency: s.enum(['USD', 'EUR', 'BRL'] as const),
      category: s.object({
        id: s.number().int(),
        name: s.string(),
        parentId: s.number().int().nullable(),
      }),
      tags: s.array(s.string()).max(10),
      variants: s.array(
        s.object({
          sku: s.string(),
          color: s.string().optional(),
          size: s.string().optional(),
          stock: s.number().int().nonnegative(),
          priceModifier: s.number().default(0),
        }),
      ),
      isActive: s.boolean().default(true),
      createdAt: s.string().datetime(),
    });

    it('should validate a complete product', () => {
      const validProduct = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Premium Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 299.99,
        currency: 'USD',
        category: {
          id: 1,
          name: 'Electronics',
          parentId: null,
        },
        tags: ['audio', 'wireless', 'premium'],
        variants: [
          { sku: 'HP-BLK-001', color: 'Black', stock: 50, priceModifier: 0 },
          { sku: 'HP-WHT-001', color: 'White', stock: 30, priceModifier: 10 },
        ],
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z',
      };

      const result = productSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it('should apply default values', () => {
      const minimalProduct = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Basic Product',
        price: 9.99,
        currency: 'USD',
        category: { id: 1, name: 'General', parentId: null },
        tags: [],
        variants: [{ sku: 'BP-001', stock: 100 }],
        createdAt: '2024-01-15T10:30:00Z',
      };

      const result = productSchema.safeParse(minimalProduct);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(true);
        expect(result.data.variants[0]?.priceModifier).toBe(0);
      }
    });

    it('should reject invalid currency', () => {
      const invalidProduct = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Product',
        price: 10,
        currency: 'GBP', // Not in enum
        category: { id: 1, name: 'General', parentId: null },
        tags: [],
        variants: [],
        createdAt: '2024-01-15T10:30:00Z',
      };

      const result = productSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(['currency']);
      }
    });

    it('should reject negative stock', () => {
      const invalidProduct = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Product',
        price: 10,
        currency: 'USD',
        category: { id: 1, name: 'General', parentId: null },
        tags: [],
        variants: [{ sku: 'SKU-001', stock: -5 }],
        createdAt: '2024-01-15T10:30:00Z',
      };

      const result = productSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('stock');
      }
    });
  });

  describe('API Response Schema', () => {
    const userSchema = s.object({
      id: s.number().int(),
      name: s.string(),
      email: s.string().email(),
    });

    const usersResponseSchema = s.object({
      data: s.array(userSchema),
      pagination: s.object({
        page: s.number().int().min(1),
        pageSize: s.number().int().min(1).max(100),
        totalItems: s.number().int().nonnegative(),
        totalPages: s.number().int().nonnegative(),
      }),
      meta: s
        .object({
          requestId: s.string().uuid(),
          timestamp: s.string().datetime(),
        })
        .optional(),
    });

    it('should validate paginated response', () => {
      const response = {
        data: [
          { id: 1, name: 'Alice', email: 'alice@example.com' },
          { id: 2, name: 'Bob', email: 'bob@example.com' },
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 2,
          totalPages: 1,
        },
        meta: {
          requestId: '550e8400-e29b-41d4-a716-446655440000',
          timestamp: '2024-01-15T10:30:00Z',
        },
      };

      const result = usersResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });
  });

  describe('Configuration Schema', () => {
    const configSchema = s.object({
      app: s.object({
        name: s.string(),
        version: s.string().pattern(/^\d+\.\d+\.\d+$/),
        environment: s.enum(['development', 'staging', 'production'] as const),
      }),
      database: s.object({
        host: s.string(),
        port: s.number().int().min(1).max(65535),
        name: s.string(),
        ssl: s.boolean().default(false),
        poolSize: s.number().int().min(1).max(100).default(10),
      }),
      features: s.object({
        enableNewUI: s.boolean().default(false),
        maxUploadSize: s.number().int().default(10485760), // 10MB
        allowedOrigins: s.array(s.string()).default([]),
      }),
      logging: s
        .object({
          level: s.enum(['debug', 'info', 'warn', 'error'] as const).default('info'),
          format: s.enum(['json', 'text'] as const).default('json'),
        })
        .optional(),
    });

    it('should validate complete config', () => {
      const config = {
        app: {
          name: 'MyApp',
          version: '1.0.0',
          environment: 'production',
        },
        database: {
          host: 'db.example.com',
          port: 5432,
          name: 'myapp_prod',
          ssl: true,
          poolSize: 20,
        },
        features: {
          enableNewUI: true,
          maxUploadSize: 52428800,
          allowedOrigins: ['https://example.com', 'https://app.example.com'],
        },
        logging: {
          level: 'warn',
          format: 'json',
        },
      };

      const result = configSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should apply all defaults for minimal config', () => {
      const minimalConfig = {
        app: {
          name: 'MyApp',
          version: '0.1.0',
          environment: 'development',
        },
        database: {
          host: 'localhost',
          port: 5432,
          name: 'myapp_dev',
        },
        features: {},
      };

      const result = configSchema.safeParse(minimalConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.database.ssl).toBe(false);
        expect(result.data.database.poolSize).toBe(10);
        expect(result.data.features.enableNewUI).toBe(false);
        expect(result.data.features.maxUploadSize).toBe(10485760);
        expect(result.data.features.allowedOrigins).toEqual([]);
      }
    });

    it('should reject invalid version format', () => {
      const invalidConfig = {
        app: {
          name: 'MyApp',
          version: 'v1.0', // Invalid format
          environment: 'development',
        },
        database: {
          host: 'localhost',
          port: 5432,
          name: 'myapp_dev',
        },
        features: {},
      };

      const result = configSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('version');
      }
    });

    it('should reject invalid port', () => {
      const invalidConfig = {
        app: {
          name: 'MyApp',
          version: '1.0.0',
          environment: 'development',
        },
        database: {
          host: 'localhost',
          port: 99999, // Invalid port
          name: 'myapp_dev',
        },
        features: {},
      };

      const result = configSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('port');
      }
    });
  });
});
