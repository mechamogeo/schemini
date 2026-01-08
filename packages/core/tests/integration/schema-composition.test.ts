import { describe, expect, it } from 'vitest';
import { s } from '../../src/index.js';

describe('Schema Composition Integration Tests', () => {
  describe('Object Schema Composition', () => {
    const baseUserSchema = s.object({
      id: s.number().int(),
      email: s.string().email(),
      createdAt: s.string().datetime(),
    });

    describe('extend()', () => {
      const fullUserSchema = baseUserSchema.extend({
        name: s.string().min(1),
        age: s.number().int().min(0).optional(),
        role: s.enum(['admin', 'user', 'guest'] as const),
      });

      it('should validate extended schema', () => {
        const user = {
          id: 1,
          email: 'user@example.com',
          createdAt: '2024-01-15T10:00:00Z',
          name: 'John Doe',
          age: 30,
          role: 'admin',
        };

        const result = fullUserSchema.safeParse(user);
        expect(result.success).toBe(true);
      });

      it('should require all fields from both schemas', () => {
        const incompleteUser = {
          id: 1,
          email: 'user@example.com',
          // missing createdAt from base
          name: 'John Doe',
          role: 'user',
        };

        const result = fullUserSchema.safeParse(incompleteUser);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some((i) => i.path.includes('createdAt'))).toBe(true);
        }
      });

      it('should allow chained extensions', () => {
        const adminSchema = fullUserSchema.extend({
          permissions: s.array(s.string()),
          department: s.string(),
        });

        const admin = {
          id: 1,
          email: 'admin@example.com',
          createdAt: '2024-01-15T10:00:00Z',
          name: 'Admin User',
          role: 'admin',
          permissions: ['read', 'write', 'delete'],
          department: 'Engineering',
        };

        const result = adminSchema.safeParse(admin);
        expect(result.success).toBe(true);
      });
    });

    describe('pick()', () => {
      const pickedSchema = baseUserSchema.pick('id', 'email');

      it('should only include picked fields', () => {
        const data = {
          id: 1,
          email: 'user@example.com',
        };

        const result = pickedSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(Object.keys(result.data)).toEqual(['id', 'email']);
        }
      });

      it('should ignore extra fields', () => {
        const data = {
          id: 1,
          email: 'user@example.com',
          createdAt: '2024-01-15T10:00:00Z', // Extra field
          name: 'John', // Extra field
        };

        const result = pickedSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).not.toHaveProperty('createdAt');
          expect(result.data).not.toHaveProperty('name');
        }
      });
    });

    describe('omit()', () => {
      const omittedSchema = baseUserSchema.omit('createdAt');

      it('should exclude omitted fields', () => {
        const data = {
          id: 1,
          email: 'user@example.com',
        };

        const result = omittedSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it('should not require omitted fields', () => {
        const data = {
          id: 1,
          email: 'user@example.com',
          createdAt: '2024-01-15T10:00:00Z', // Should be ignored
        };

        const result = omittedSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).not.toHaveProperty('createdAt');
        }
      });
    });

    describe('partial()', () => {
      const partialSchema = baseUserSchema.partial();

      it('should make all fields optional', () => {
        const emptyData = {};
        const result = partialSchema.safeParse(emptyData);
        expect(result.success).toBe(true);
      });

      it('should still validate provided fields', () => {
        const invalidData = {
          email: 'not-an-email',
        };

        const result = partialSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.path).toEqual(['email']);
        }
      });

      it('should accept partial data', () => {
        const partialData = {
          id: 1,
          email: 'user@example.com',
          // createdAt omitted
        };

        const result = partialSchema.safeParse(partialData);
        expect(result.success).toBe(true);
      });
    });

    describe('required()', () => {
      const optionalSchema = s.object({
        name: s.string().optional(),
        age: s.number().optional(),
        email: s.string().email().optional(),
      });

      const requiredSchema = optionalSchema.required();

      it('should make all fields required', () => {
        const incompleteData = {
          name: 'John',
          // missing age and email
        };

        const result = requiredSchema.safeParse(incompleteData);
        expect(result.success).toBe(false);
      });

      it('should validate complete data', () => {
        const completeData = {
          name: 'John',
          age: 30,
          email: 'john@example.com',
        };

        const result = requiredSchema.safeParse(completeData);
        expect(result.success).toBe(true);
      });
    });

    describe('Combined Composition', () => {
      const baseSchema = s.object({
        id: s.number().int(),
        name: s.string(),
        email: s.string().email(),
        password: s.string().min(8),
        role: s.enum(['admin', 'user'] as const),
        createdAt: s.string().datetime(),
        updatedAt: s.string().datetime(),
      });

      it('should support pick + partial for update DTOs', () => {
        const updateUserDTO = baseSchema.pick('name', 'email').partial();

        const validUpdate = { name: 'New Name' };
        expect(updateUserDTO.safeParse(validUpdate).success).toBe(true);

        const emptyUpdate = {};
        expect(updateUserDTO.safeParse(emptyUpdate).success).toBe(true);
      });

      it('should support omit for create DTOs', () => {
        const createUserDTO = baseSchema.omit('id', 'createdAt', 'updatedAt');

        const validCreate = {
          name: 'New User',
          email: 'new@example.com',
          password: 'securePassword123',
          role: 'user',
        };

        expect(createUserDTO.safeParse(validCreate).success).toBe(true);
      });

      it('should support extend + omit for profile schema', () => {
        const profileSchema = baseSchema.omit('password').extend({
          avatar: s.string().optional(),
          bio: s.string().max(500).optional(),
        });

        const profile = {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          avatar: 'https://example.com/avatar.jpg',
          bio: 'Software developer',
        };

        const result = profileSchema.safeParse(profile);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).not.toHaveProperty('password');
        }
      });
    });
  });

  describe('Union Schemas', () => {
    const successResponseSchema = s.object({
      status: s.literal('success'),
      data: s.object({
        id: s.number(),
        name: s.string(),
      }),
    });

    const errorResponseSchema = s.object({
      status: s.literal('error'),
      error: s.object({
        code: s.string(),
        message: s.string(),
      }),
    });

    const apiResponseSchema = s.union([successResponseSchema, errorResponseSchema]);

    it('should validate success response', () => {
      const successResponse = {
        status: 'success',
        data: { id: 1, name: 'Test' },
      };

      const result = apiResponseSchema.safeParse(successResponse);
      expect(result.success).toBe(true);
    });

    it('should validate error response', () => {
      const errorResponse = {
        status: 'error',
        error: { code: 'NOT_FOUND', message: 'Resource not found' },
      };

      const result = apiResponseSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
    });

    it('should reject invalid response', () => {
      const invalidResponse = {
        status: 'pending',
        data: null,
      };

      const result = apiResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe('Array of Objects Composition', () => {
    const itemSchema = s.object({
      id: s.number().int(),
      name: s.string(),
      quantity: s.number().int().min(1),
      price: s.number().min(0),
    });

    const orderSchema = s.object({
      orderId: s.string().uuid(),
      customer: s.object({
        id: s.number().int(),
        email: s.string().email(),
      }),
      items: s.array(itemSchema).nonempty(),
      discount: s.number().min(0).max(100).default(0),
      notes: s.string().optional(),
    });

    it('should validate order with multiple items', () => {
      const order = {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        customer: { id: 1, email: 'customer@example.com' },
        items: [
          { id: 1, name: 'Widget', quantity: 2, price: 29.99 },
          { id: 2, name: 'Gadget', quantity: 1, price: 49.99 },
        ],
      };

      const result = orderSchema.safeParse(order);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.discount).toBe(0); // Default applied
      }
    });

    it('should reject order with empty items', () => {
      const order = {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        customer: { id: 1, email: 'customer@example.com' },
        items: [],
      };

      const result = orderSchema.safeParse(order);
      expect(result.success).toBe(false);
    });

    it('should validate nested item errors', () => {
      const order = {
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        customer: { id: 1, email: 'customer@example.com' },
        items: [
          { id: 1, name: 'Widget', quantity: 0, price: 29.99 }, // Invalid quantity
        ],
      };

      const result = orderSchema.safeParse(order);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('quantity');
      }
    });
  });
});
