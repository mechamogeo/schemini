import type { ParseContext, ParseResult } from '../errors/types';
import { BaseType } from './base';

/**
 * Coerced string type - converts any value to string
 */
export class CoercedStringType extends BaseType<string> {
  _parse(value: unknown, ctx: ParseContext): ParseResult<string> {
    if (value === null || value === undefined) {
      return this._createError(ctx, {
        code: 'invalid_type',
        expected: 'string',
        received: value === null ? 'null' : 'undefined',
      });
    }
    return { success: true, data: String(value) };
  }
}

/**
 * Coerced number type - converts string/boolean to number
 */
export class CoercedNumberType extends BaseType<number> {
  _parse(value: unknown, ctx: ParseContext): ParseResult<number> {
    if (value === null || value === undefined) {
      return this._createError(ctx, {
        code: 'invalid_type',
        expected: 'number',
        received: value === null ? 'null' : 'undefined',
      });
    }

    const num = Number(value);

    if (Number.isNaN(num)) {
      return this._createError(ctx, {
        code: 'invalid_type',
        expected: 'number',
        received: typeof value,
      });
    }

    return { success: true, data: num };
  }
}

/**
 * Coerced boolean type - converts truthy/falsy values to boolean
 */
export class CoercedBooleanType extends BaseType<boolean> {
  _parse(value: unknown, ctx: ParseContext): ParseResult<boolean> {
    if (value === null || value === undefined) {
      return this._createError(ctx, {
        code: 'invalid_type',
        expected: 'boolean',
        received: value === null ? 'null' : 'undefined',
      });
    }

    // Handle string "true"/"false"
    if (value === 'true') return { success: true, data: true };
    if (value === 'false') return { success: true, data: false };

    // Handle numbers
    if (value === 1) return { success: true, data: true };
    if (value === 0) return { success: true, data: false };

    // Handle actual booleans
    if (typeof value === 'boolean') {
      return { success: true, data: value };
    }

    // Coerce to boolean
    return { success: true, data: Boolean(value) };
  }
}
