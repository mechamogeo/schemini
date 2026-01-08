import type { ParseContext, ParseResult } from '../errors/types';
import { BaseType } from './base';

/**
 * Primitive types that can be used as literals
 */
export type LiteralValue = string | number | boolean | null | undefined;

/**
 * Schema type for literal (exact value) validation
 */
export class LiteralType<T extends LiteralValue> extends BaseType<T> {
  readonly value: T;

  constructor(value: T) {
    super();
    this.value = value;
  }

  _parse(input: unknown, ctx: ParseContext): ParseResult<T> {
    if (input !== this.value) {
      return this._createError(ctx, {
        code: 'invalid_literal',
        expected: String(this.value),
        received:
          input === null ? 'null' : typeof input === 'undefined' ? 'undefined' : String(input),
      });
    }

    return { success: true, data: input as T };
  }

  _clone(): LiteralType<T> {
    return new LiteralType(this.value);
  }
}
