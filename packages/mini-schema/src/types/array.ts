import type { ValidationError } from "../errors";
import type { ParseContext, ParseResult } from "../errors/types";
import { BaseType } from "./base";

/**
 * Options for length validators
 */
interface LengthOptions {
  message?: string;
}

/**
 * Constructor options for ArrayType
 */
interface ArrayTypeOptions {
  minLength: number | undefined;
  maxLength: number | undefined;
  exactLength: number | undefined;
  minMessage: string | undefined;
  maxMessage: string | undefined;
  lengthMessage: string | undefined;
}

/**
 * Schema type for array validation
 */
export class ArrayType<T> extends BaseType<T[]> {
  readonly element: BaseType<T>;
  private _minLength: number | undefined;
  private _maxLength: number | undefined;
  private _exactLength: number | undefined;
  private _minMessage: string | undefined;
  private _maxMessage: string | undefined;
  private _lengthMessage: string | undefined;

  constructor(element: BaseType<T>, options?: ArrayTypeOptions) {
    super();
    this.element = element;
    this._minLength = options?.minLength;
    this._maxLength = options?.maxLength;
    this._exactLength = options?.exactLength;
    this._minMessage = options?.minMessage;
    this._maxMessage = options?.maxMessage;
    this._lengthMessage = options?.lengthMessage;
  }

  _parse(value: unknown, ctx: ParseContext): ParseResult<T[]> {
    // Check if value is an array
    if (!Array.isArray(value)) {
      return this._createError(ctx, {
        code: "invalid_type",
        expected: "array",
        received: value === null ? "null" : typeof value,
      });
    }

    // Check exact length
    if (this._exactLength !== undefined && value.length !== this._exactLength) {
      return this._createError(ctx, {
        code: "too_small",
        minimum: this._exactLength,
        inclusive: true,
        expected: "array",
        message: this._lengthMessage,
      });
    }

    // Check min length
    if (this._minLength !== undefined && value.length < this._minLength) {
      return this._createError(ctx, {
        code: "too_small",
        minimum: this._minLength,
        inclusive: true,
        expected: "array",
        message: this._minMessage,
      });
    }

    // Check max length
    if (this._maxLength !== undefined && value.length > this._maxLength) {
      return this._createError(ctx, {
        code: "too_big",
        maximum: this._maxLength,
        inclusive: true,
        expected: "array",
        message: this._maxMessage,
      });
    }

    // Validate each element
    const result: T[] = [];
    const errors: ValidationError[] = [];

    for (let i = 0; i < value.length; i++) {
      const elementCtx: ParseContext = {
        ...ctx,
        path: [...ctx.path, i],
      };

      const elementResult = this.element._parse(value[i], elementCtx);

      if (!elementResult.success) {
        errors.push(elementResult.error);
      } else {
        result.push(elementResult.data);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: this._mergeErrors(errors),
      };
    }

    return { success: true, data: result };
  }

  /**
   * Require minimum array length
   */
  min(length: number, options?: LengthOptions): ArrayType<T> {
    return new ArrayType(this.element, {
      minLength: length,
      maxLength: this._maxLength,
      exactLength: this._exactLength,
      minMessage: options?.message,
      maxMessage: this._maxMessage,
      lengthMessage: this._lengthMessage,
    });
  }

  /**
   * Require maximum array length
   */
  max(length: number, options?: LengthOptions): ArrayType<T> {
    return new ArrayType(this.element, {
      minLength: this._minLength,
      maxLength: length,
      exactLength: this._exactLength,
      minMessage: this._minMessage,
      maxMessage: options?.message,
      lengthMessage: this._lengthMessage,
    });
  }

  /**
   * Require exact array length
   */
  length(length: number, options?: LengthOptions): ArrayType<T> {
    return new ArrayType(this.element, {
      minLength: this._minLength,
      maxLength: this._maxLength,
      exactLength: length,
      minMessage: this._minMessage,
      maxMessage: this._maxMessage,
      lengthMessage: options?.message,
    });
  }

  /**
   * Require non-empty array (at least 1 element)
   */
  nonempty(options?: LengthOptions): ArrayType<T> {
    return this.min(1, options);
  }
}
