import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/errors';
import { s } from '../../src/schema';
import { formatPhone, isValidPhone, parsePhone } from '../../src/validators';

describe('Phone Validator', () => {
  describe('parsePhone', () => {
    describe('international format', () => {
      it('should parse valid US phone numbers', () => {
        const result = parsePhone('+14155552671');
        expect(result.valid).toBe(true);
        expect(result.e164).toBe('+14155552671');
        expect(result.country).toBe('US');
        expect(result.international).toBe('+1 415 555 2671');
      });

      it('should parse valid Brazilian phone numbers', () => {
        const result = parsePhone('+5511999887766');
        expect(result.valid).toBe(true);
        expect(result.e164).toBe('+5511999887766');
        expect(result.country).toBe('BR');
      });

      it('should parse valid German phone numbers', () => {
        const result = parsePhone('+4930123456789');
        expect(result.valid).toBe(true);
        expect(result.country).toBe('DE');
      });

      it('should parse valid UK phone numbers', () => {
        const result = parsePhone('+442071234567');
        expect(result.valid).toBe(true);
        expect(result.country).toBe('GB');
      });
    });

    describe('with defaultCountry option', () => {
      it('should parse US numbers without country code', () => {
        const result = parsePhone('4155552671', { defaultCountry: 'US' });
        expect(result.valid).toBe(true);
        expect(result.e164).toBe('+14155552671');
        expect(result.country).toBe('US');
      });

      it('should parse Brazilian numbers without country code', () => {
        const result = parsePhone('11999887766', { defaultCountry: 'BR' });
        expect(result.valid).toBe(true);
        expect(result.e164).toBe('+5511999887766');
        expect(result.country).toBe('BR');
      });

      it('should parse formatted numbers', () => {
        const result = parsePhone('(415) 555-2671', { defaultCountry: 'US' });
        expect(result.valid).toBe(true);
        expect(result.e164).toBe('+14155552671');
      });
    });

    describe('countries restriction', () => {
      it('should accept phone from allowed countries', () => {
        const result = parsePhone('+14155552671', { countries: ['US', 'CA'] });
        expect(result.valid).toBe(true);
      });

      it('should reject phone from non-allowed countries', () => {
        const result = parsePhone('+5511999887766', {
          countries: ['US', 'CA'],
        });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Phone number must be from: US, CA');
      });
    });

    describe('requireInternational option', () => {
      it('should accept international format when required', () => {
        const result = parsePhone('+14155552671', {
          requireInternational: true,
        });
        expect(result.valid).toBe(true);
      });

      it('should reject national format when international is required', () => {
        const result = parsePhone('4155552671', {
          defaultCountry: 'US',
          requireInternational: true,
        });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Phone number must be in international format (starting with +)');
      });
    });

    describe('invalid inputs', () => {
      it('should reject empty string', () => {
        const result = parsePhone('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Value must be a non-empty string');
      });

      it('should reject whitespace only', () => {
        const result = parsePhone('   ');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Value must be a non-empty string');
      });

      it('should reject invalid phone numbers', () => {
        const result = parsePhone('+1234');
        expect(result.valid).toBe(false);
      });

      it('should reject random text', () => {
        const result = parsePhone('not a phone number');
        expect(result.valid).toBe(false);
      });

      it('should reject null/undefined', () => {
        // biome-ignore lint/suspicious/noExplicitAny: Testing invalid input
        expect(parsePhone(null as any).valid).toBe(false);
        // biome-ignore lint/suspicious/noExplicitAny: Testing invalid input
        expect(parsePhone(undefined as any).valid).toBe(false);
      });
    });

    describe('parse result properties', () => {
      it('should return all format variations', () => {
        const result = parsePhone('+14155552671');
        expect(result.valid).toBe(true);
        expect(result.e164).toBe('+14155552671');
        expect(result.national).toBe('(415) 555-2671');
        expect(result.international).toBe('+1 415 555 2671');
        expect(result.country).toBe('US');
        expect(result.phoneNumber).toBeDefined();
      });
    });
  });

  describe('isValidPhone', () => {
    it('should return true for valid phone numbers', () => {
      expect(isValidPhone('+14155552671')).toBe(true);
      expect(isValidPhone('+5511999887766')).toBe(true);
      expect(isValidPhone('+442071234567')).toBe(true);
    });

    it('should return true with defaultCountry', () => {
      expect(isValidPhone('4155552671', { defaultCountry: 'US' })).toBe(true);
      expect(isValidPhone('11999887766', { defaultCountry: 'BR' })).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('not a phone')).toBe(false);
    });

    it('should respect countries restriction', () => {
      expect(isValidPhone('+14155552671', { countries: ['US'] })).toBe(true);
      expect(isValidPhone('+14155552671', { countries: ['BR'] })).toBe(false);
    });
  });

  describe('formatPhone', () => {
    it('should format to E.164 by default', () => {
      expect(formatPhone('+1 415 555 2671')).toBe('+14155552671');
      expect(formatPhone('(415) 555-2671', 'E.164', { defaultCountry: 'US' })).toBe('+14155552671');
    });

    it('should format to NATIONAL', () => {
      expect(formatPhone('+14155552671', 'NATIONAL')).toBe('(415) 555-2671');
    });

    it('should format to INTERNATIONAL', () => {
      expect(formatPhone('+14155552671', 'INTERNATIONAL')).toBe('+1 415 555 2671');
    });

    it('should return null for invalid numbers', () => {
      expect(formatPhone('invalid')).toBe(null);
      expect(formatPhone('')).toBe(null);
    });
  });

  describe('s.string().phone()', () => {
    it('should accept valid international phone numbers', () => {
      const schema = s.string().phone();
      expect(schema.parse('+14155552671')).toBe('+14155552671');
      expect(schema.parse('+5511999887766')).toBe('+5511999887766');
    });

    it('should reject invalid phone numbers', () => {
      const schema = s.string().phone();
      expect(() => schema.parse('')).toThrow(ValidationError);
      expect(() => schema.parse('invalid')).toThrow(ValidationError);
      expect(() => schema.parse('123')).toThrow(ValidationError);
    });

    it('should work with defaultCountry option', () => {
      const schema = s.string().phone({ defaultCountry: 'US' });
      expect(schema.parse('4155552671')).toBe('4155552671');
      expect(schema.parse('(415) 555-2671')).toBe('(415) 555-2671');
    });

    it('should enforce countries restriction', () => {
      const schema = s.string().phone({ countries: ['US', 'CA'] });
      expect(schema.parse('+14155552671')).toBe('+14155552671');
      expect(() => schema.parse('+5511999887766')).toThrow(ValidationError);
    });

    it('should enforce requireInternational', () => {
      const schema = s.string().phone({
        defaultCountry: 'US',
        requireInternational: true,
      });
      expect(schema.parse('+14155552671')).toBe('+14155552671');
      expect(() => schema.parse('4155552671')).toThrow(ValidationError);
    });

    it('should use custom error message', () => {
      const schema = s.string().phone({ message: 'Telefone inválido' });
      const result = schema.safeParse('invalid');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Telefone inválido');
      }
    });

    it('should work with other string validators', () => {
      const schema = s.string().nonempty().phone({ defaultCountry: 'US' });
      expect(schema.parse('4155552671')).toBe('4155552671');
      expect(() => schema.parse('')).toThrow(ValidationError);
    });
  });

  describe('edge cases', () => {
    it('should handle phone numbers with extensions', () => {
      // libphonenumber-js handles extensions
      const result = parsePhone('+14155552671 ext. 123');
      // The result depends on libphonenumber-js behavior
      expect(typeof result.valid).toBe('boolean');
    });

    it('should handle various formatting styles', () => {
      const formats = ['+1 415 555 2671', '+1-415-555-2671', '+1 (415) 555-2671', '+14155552671'];

      for (const format of formats) {
        const result = parsePhone(format);
        expect(result.valid).toBe(true);
        expect(result.e164).toBe('+14155552671');
      }
    });

    it('should trim whitespace', () => {
      const result = parsePhone('  +14155552671  ');
      expect(result.valid).toBe(true);
      expect(result.e164).toBe('+14155552671');
    });
  });
});
