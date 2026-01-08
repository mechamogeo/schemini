import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors';
import { s } from '../../src/schema';

describe('BooleanType', () => {
  describe('basic validation', () => {
    it('should accept true', () => {
      const schema = s.boolean();

      expect(schema.parse(true)).toBe(true);
    });

    it('should accept false', () => {
      const schema = s.boolean();

      expect(schema.parse(false)).toBe(false);
    });

    it('should reject string "true"', () => {
      const schema = s.boolean();

      expect(() => schema.parse('true')).toThrow(ValidationError);
    });

    it('should reject string "false"', () => {
      const schema = s.boolean();

      expect(() => schema.parse('false')).toThrow(ValidationError);
    });

    it('should reject number 1', () => {
      const schema = s.boolean();

      expect(() => schema.parse(1)).toThrow(ValidationError);
    });

    it('should reject number 0', () => {
      const schema = s.boolean();

      expect(() => schema.parse(0)).toThrow(ValidationError);
    });

    it('should reject null', () => {
      const schema = s.boolean();

      expect(() => schema.parse(null)).toThrow(ValidationError);
    });

    it('should reject undefined', () => {
      const schema = s.boolean();

      expect(() => schema.parse(undefined)).toThrow(ValidationError);
    });
  });
});
