import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors';
import { s } from '../../src/schema';
import { formatCurrency, isValidCurrency, parseCurrency } from '../../src/validators';

describe('Currency Validator', () => {
  describe('parseCurrency', () => {
    describe('en-US locale (default)', () => {
      it('should parse simple dollar amounts', () => {
        expect(parseCurrency('$1,234.56')).toEqual({
          valid: true,
          value: 1234.56,
        });
        expect(parseCurrency('$100')).toEqual({ valid: true, value: 100 });
        expect(parseCurrency('$0.99')).toEqual({ valid: true, value: 0.99 });
      });

      it('should parse amounts without currency symbol', () => {
        expect(parseCurrency('1,234.56')).toEqual({
          valid: true,
          value: 1234.56,
        });
        expect(parseCurrency('100.00')).toEqual({ valid: true, value: 100 });
      });

      it('should parse large amounts with multiple grouping separators', () => {
        expect(parseCurrency('$1,234,567.89')).toEqual({
          valid: true,
          value: 1234567.89,
        });
        expect(parseCurrency('$1,000,000')).toEqual({
          valid: true,
          value: 1000000,
        });
      });
    });

    describe('pt-BR locale', () => {
      it('should parse Brazilian Real format', () => {
        expect(parseCurrency('R$ 1.234,56', { locale: 'pt-BR' })).toEqual({
          valid: true,
          value: 1234.56,
        });
        expect(parseCurrency('R$ 100,00', { locale: 'pt-BR' })).toEqual({
          valid: true,
          value: 100,
        });
      });

      it('should parse amounts without currency symbol', () => {
        expect(parseCurrency('1.234,56', { locale: 'pt-BR' })).toEqual({
          valid: true,
          value: 1234.56,
        });
        expect(parseCurrency('0,99', { locale: 'pt-BR' })).toEqual({
          valid: true,
          value: 0.99,
        });
      });

      it('should parse large amounts', () => {
        expect(parseCurrency('R$ 1.234.567,89', { locale: 'pt-BR' })).toEqual({
          valid: true,
          value: 1234567.89,
        });
      });
    });

    describe('de-DE locale', () => {
      it('should parse Euro format (German)', () => {
        expect(parseCurrency('1.234,56 €', { locale: 'de-DE' })).toEqual({
          valid: true,
          value: 1234.56,
        });
        expect(parseCurrency('100,00 €', { locale: 'de-DE' })).toEqual({
          valid: true,
          value: 100,
        });
      });
    });

    describe('negative values', () => {
      it('should parse negative with prefix minus', () => {
        expect(parseCurrency('-$100.00')).toEqual({ valid: true, value: -100 });
        expect(parseCurrency('- $1,234.56')).toEqual({
          valid: true,
          value: -1234.56,
        });
      });

      it('should parse negative with suffix minus', () => {
        expect(parseCurrency('$100.00-')).toEqual({ valid: true, value: -100 });
      });

      it('should parse negative with parentheses (accounting format)', () => {
        expect(parseCurrency('($100.00)')).toEqual({
          valid: true,
          value: -100,
        });
        expect(parseCurrency('($1,234.56)')).toEqual({
          valid: true,
          value: -1234.56,
        });
      });

      it('should parse negative with unicode minus sign', () => {
        expect(parseCurrency('−$100.00')).toEqual({ valid: true, value: -100 });
      });

      it('should reject negative when allowNegative is false', () => {
        const result = parseCurrency('-$100.00', { allowNegative: false });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Negative values are not allowed');
      });
    });

    describe('min/max constraints', () => {
      it('should enforce minimum value', () => {
        const result = parseCurrency('$50.00', { min: 100 });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Value must be at least 100');
      });

      it('should accept value at minimum', () => {
        expect(parseCurrency('$100.00', { min: 100 })).toEqual({
          valid: true,
          value: 100,
        });
      });

      it('should enforce maximum value', () => {
        const result = parseCurrency('$200.00', { max: 100 });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Value must be at most 100');
      });

      it('should accept value at maximum', () => {
        expect(parseCurrency('$100.00', { max: 100 })).toEqual({
          valid: true,
          value: 100,
        });
      });

      it('should work with both min and max', () => {
        expect(parseCurrency('$50.00', { min: 10, max: 100 })).toEqual({
          valid: true,
          value: 50,
        });

        expect(parseCurrency('$5.00', { min: 10, max: 100 }).valid).toBe(false);
        expect(parseCurrency('$150.00', { min: 10, max: 100 }).valid).toBe(false);
      });
    });

    describe('invalid inputs', () => {
      it('should reject empty string', () => {
        const result = parseCurrency('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Value must be a non-empty string');
      });

      it('should reject string with only currency symbol', () => {
        const result = parseCurrency('$');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('No numeric value found');
      });

      it('should reject non-string values', () => {
        // biome-ignore lint/suspicious/noExplicitAny: Testing invalid input
        const result = parseCurrency(null as any);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('isValidCurrency', () => {
    it('should return true for valid currency strings', () => {
      expect(isValidCurrency('$100.00')).toBe(true);
      expect(isValidCurrency('R$ 1.234,56', { locale: 'pt-BR' })).toBe(true);
      expect(isValidCurrency('1,234.56')).toBe(true);
    });

    it('should return false for invalid currency strings', () => {
      expect(isValidCurrency('')).toBe(false);
      expect(isValidCurrency('abc')).toBe(false);
    });

    it('should respect constraints', () => {
      expect(isValidCurrency('-$100', { allowNegative: false })).toBe(false);
      expect(isValidCurrency('$50', { min: 100 })).toBe(false);
      expect(isValidCurrency('$200', { max: 100 })).toBe(false);
    });
  });

  describe('formatCurrency', () => {
    it('should format USD by default', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(0.99)).toBe('$0.99');
    });

    it('should format negative values', () => {
      expect(formatCurrency(-100)).toBe('-$100.00');
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('should format BRL with pt-BR locale', () => {
      const result = formatCurrency(1234.56, {
        currency: 'BRL',
        locale: 'pt-BR',
      });
      // Result should contain R$ and use comma for decimal
      expect(result).toContain('R$');
      expect(result).toMatch(/1\.234,56/);
    });

    it('should format EUR with de-DE locale', () => {
      const result = formatCurrency(1234.56, {
        currency: 'EUR',
        locale: 'de-DE',
      });
      // Should use comma for decimal and period for grouping
      expect(result).toMatch(/1\.234,56/);
      expect(result).toContain('€');
    });
  });

  describe('s.string().currency()', () => {
    it('should accept valid currency strings', () => {
      const schema = s.string().currency();
      expect(schema.parse('$100.00')).toBe('$100.00');
      expect(schema.parse('1,234.56')).toBe('1,234.56');
    });

    it('should reject invalid currency strings', () => {
      const schema = s.string().currency();
      expect(() => schema.parse('')).toThrow(ValidationError);
      expect(() => schema.parse('abc')).toThrow(ValidationError);
    });

    it('should work with locale option', () => {
      const schema = s.string().currency({ locale: 'pt-BR' });
      expect(schema.parse('R$ 1.234,56')).toBe('R$ 1.234,56');
    });

    it('should enforce allowNegative constraint', () => {
      const schema = s.string().currency({ allowNegative: false });
      expect(() => schema.parse('-$100')).toThrow(ValidationError);
      expect(schema.parse('$100')).toBe('$100');
    });

    it('should enforce min constraint', () => {
      const schema = s.string().currency({ min: 100 });
      expect(() => schema.parse('$50')).toThrow(ValidationError);
      expect(schema.parse('$100')).toBe('$100');
    });

    it('should enforce max constraint', () => {
      const schema = s.string().currency({ max: 100 });
      expect(() => schema.parse('$200')).toThrow(ValidationError);
      expect(schema.parse('$100')).toBe('$100');
    });

    it('should use custom error message', () => {
      const schema = s.string().currency({ message: 'Valor inválido' });
      const result = schema.safeParse('invalid');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Valor inválido');
      }
    });

    it('should work with other string validators', () => {
      const schema = s.string().nonempty().currency({ min: 0 });
      expect(schema.parse('$100')).toBe('$100');
      expect(() => schema.parse('')).toThrow(ValidationError);
    });
  });

  describe('edge cases', () => {
    it('should handle zero values', () => {
      expect(parseCurrency('$0.00')).toEqual({ valid: true, value: 0 });
      expect(parseCurrency('$0')).toEqual({ valid: true, value: 0 });
      expect(parseCurrency('R$ 0,00', { locale: 'pt-BR' })).toEqual({
        valid: true,
        value: 0,
      });
    });

    it('should handle very small decimal values', () => {
      expect(parseCurrency('$0.01')).toEqual({ valid: true, value: 0.01 });
      expect(parseCurrency('$0.001')).toEqual({ valid: true, value: 0.001 });
    });

    it('should handle values with extra whitespace', () => {
      expect(parseCurrency('  $100.00  ')).toEqual({ valid: true, value: 100 });
      expect(parseCurrency('$ 100.00')).toEqual({ valid: true, value: 100 });
    });

    it('should handle values without decimal places', () => {
      expect(parseCurrency('$1,234')).toEqual({ valid: true, value: 1234 });
      expect(parseCurrency('1234')).toEqual({ valid: true, value: 1234 });
    });
  });
});
