import type { ParseContext, ParseResult } from '../errors/types';
import { BaseType } from './base';

/**
 * Schema type for enum validation
 */
export class EnumType<
  T extends readonly [string | number, ...(string | number)[]],
> extends BaseType<T[number]> {
  readonly options: T;

  constructor(options: T) {
    super();
    this.options = options;
  }

  _parse(input: unknown, ctx: ParseContext): ParseResult<T[number]> {
    if (!this.options.includes(input as T[number])) {
      return this._createError(ctx, {
        code: 'invalid_enum',
        options: this.options as unknown as string[],
        received:
          input === null ? 'null' : typeof input === 'undefined' ? 'undefined' : String(input),
      });
    }

    return { success: true, data: input as T[number] };
  }

  _clone(): EnumType<T> {
    return new EnumType(this.options);
  }
}
