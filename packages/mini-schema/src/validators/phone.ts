/**
 * Phone number validation using libphonenumber-js
 */
import {
  type CountryCode,
  type E164Number,
  type NumberFormat,
  type PhoneNumber,
  parsePhoneNumber,
} from 'libphonenumber-js';

/**
 * Options for phone number validation
 */
export interface PhoneOptions {
  /**
   * Default country code for parsing numbers without country code
   * ISO 3166-1 alpha-2 country code (e.g., 'US', 'BR', 'DE')
   */
  defaultCountry?: CountryCode;
  /**
   * Restrict validation to specific countries
   * If provided, only phone numbers from these countries are valid
   */
  countries?: CountryCode[];
  /**
   * Whether to require the phone number to be in international format
   */
  requireInternational?: boolean;
}

/**
 * Result of parsing a phone number
 */
export interface PhoneParseResult {
  valid: boolean;
  /** Parsed phone number object */
  phoneNumber?: PhoneNumber;
  /** E.164 format (e.g., +14155552671) */
  e164?: E164Number;
  /** National format (e.g., (415) 555-2671) */
  national?: string;
  /** International format (e.g., +1 415 555 2671) */
  international?: string;
  /** Country code (e.g., 'US') */
  country?: CountryCode | undefined;
  /** Error message if invalid */
  error?: string;
}

/**
 * Parse a phone number string and extract information
 */
export function parsePhone(value: string, options: PhoneOptions = {}): PhoneParseResult {
  const { defaultCountry, countries, requireInternational } = options;

  if (!value || typeof value !== 'string') {
    return { valid: false, error: 'Value must be a non-empty string' };
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return { valid: false, error: 'Value must be a non-empty string' };
  }

  // Check if international format is required
  if (requireInternational && !trimmed.startsWith('+')) {
    return {
      valid: false,
      error: 'Phone number must be in international format (starting with +)',
    };
  }

  try {
    const phoneNumber = parsePhoneNumber(trimmed, defaultCountry);

    if (!phoneNumber) {
      return { valid: false, error: 'Could not parse phone number' };
    }

    // Check if the number is valid
    if (!phoneNumber.isValid()) {
      return { valid: false, error: 'Invalid phone number' };
    }

    // Check country restriction
    const phoneCountry = phoneNumber.country;
    if (countries && countries.length > 0 && phoneCountry) {
      if (!countries.includes(phoneCountry)) {
        return {
          valid: false,
          error: `Phone number must be from: ${countries.join(', ')}`,
        };
      }
    }

    return {
      valid: true,
      phoneNumber,
      e164: phoneNumber.format('E.164') as E164Number,
      national: phoneNumber.formatNational(),
      international: phoneNumber.formatInternational(),
      country: phoneCountry,
    };
  } catch {
    return { valid: false, error: 'Invalid phone number format' };
  }
}

/**
 * Validate a phone number string
 */
export function isValidPhone(value: string, options: PhoneOptions = {}): boolean {
  return parsePhone(value, options).valid;
}

/**
 * Format a phone number to a specific format
 */
export function formatPhone(
  value: string,
  format: NumberFormat = 'E.164',
  options: { defaultCountry?: CountryCode } = {},
): string | null {
  try {
    const phoneNumber = parsePhoneNumber(value, options.defaultCountry);

    if (!phoneNumber || !phoneNumber.isValid()) {
      return null;
    }

    return phoneNumber.format(format);
  } catch {
    return null;
  }
}

// Re-export types from libphonenumber-js for convenience
export type { CountryCode, E164Number, NumberFormat, PhoneNumber };
