/**
 * Currency validation and parsing utilities using Intl
 */

/**
 * Options for currency validation
 */
export interface CurrencyOptions {
  /**
   * ISO 4217 currency code (e.g., 'USD', 'BRL', 'EUR')
   */
  currency?: string;
  /**
   * Locale for parsing (e.g., 'en-US', 'pt-BR')
   */
  locale?: string;
  /**
   * Whether to allow negative values
   */
  allowNegative?: boolean;
  /**
   * Minimum value (inclusive)
   */
  min?: number;
  /**
   * Maximum value (inclusive)
   */
  max?: number;
}

/**
 * Result of parsing a currency string
 */
export interface CurrencyParseResult {
  valid: boolean;
  value?: number;
  error?: string;
}

/**
 * Get the decimal and grouping separators for a locale
 */
function getLocaleSeparators(locale: string): {
  decimal: string;
  group: string;
} {
  const formatter = new Intl.NumberFormat(locale);
  const parts = formatter.formatToParts(1234.5);

  let decimal = '.';
  let group = ',';

  for (const part of parts) {
    if (part.type === 'decimal') {
      decimal = part.value;
    } else if (part.type === 'group') {
      group = part.value;
    }
  }

  return { decimal, group };
}

/**
 * Parse a currency string and extract the numeric value
 * Supports various formats based on locale
 */
export function parseCurrency(value: string, options: CurrencyOptions = {}): CurrencyParseResult {
  const { locale = 'en-US', allowNegative = true, min, max } = options;

  if (!value || typeof value !== 'string') {
    return { valid: false, error: 'Value must be a non-empty string' };
  }

  // Get locale-specific separators
  const { decimal } = getLocaleSeparators(locale);

  // Remove currency symbols, whitespace, and non-breaking spaces
  // Keep digits, decimal separator, group separator, minus sign
  let cleaned = value.trim();

  // Check for negative value (can be prefix -, suffix -, or parentheses)
  let isNegative = false;
  if (cleaned.startsWith('-') || cleaned.startsWith('−')) {
    isNegative = true;
    cleaned = cleaned.slice(1).trim();
  } else if (cleaned.endsWith('-') || cleaned.endsWith('−')) {
    isNegative = true;
    cleaned = cleaned.slice(0, -1).trim();
  } else if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    isNegative = true;
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Remove currency symbols and letters (keep digits and separators)
  cleaned = cleaned.replace(/[^\d.,\-−]/g, '');

  if (!cleaned) {
    return { valid: false, error: 'No numeric value found' };
  }

  // Normalize the number based on locale
  // Replace grouping separator with nothing, decimal separator with '.'
  let normalized: string;

  if (decimal === ',') {
    // Locales like pt-BR, de-DE: 1.234,56
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // Locales like en-US: 1,234.56
    normalized = cleaned.replace(/,/g, '');
  }

  // Parse the normalized string
  const numValue = Number.parseFloat(normalized);

  if (Number.isNaN(numValue)) {
    return { valid: false, error: 'Invalid number format' };
  }

  const finalValue = isNegative ? -numValue : numValue;

  // Check negative constraint
  if (!allowNegative && finalValue < 0) {
    return { valid: false, error: 'Negative values are not allowed' };
  }

  // Check min/max constraints
  if (min !== undefined && finalValue < min) {
    return { valid: false, error: `Value must be at least ${min}` };
  }

  if (max !== undefined && finalValue > max) {
    return { valid: false, error: `Value must be at most ${max}` };
  }

  return { valid: true, value: finalValue };
}

/**
 * Validate a currency string
 */
export function isValidCurrency(value: string, options: CurrencyOptions = {}): boolean {
  return parseCurrency(value, options).valid;
}

/**
 * Format a number as currency using Intl
 */
export function formatCurrency(
  value: number,
  options: { currency?: string; locale?: string } = {},
): string {
  const { currency = 'USD', locale = 'en-US' } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}
