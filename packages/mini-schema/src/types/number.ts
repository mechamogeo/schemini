import { BaseType } from "./base";
import type {
  ParseResult,
  ParseContext,
  ErrorMessageOptions,
} from "../errors/types";

interface NumberTypeOptions {
  isInt?: boolean | undefined;
  minimum?: number | undefined;
  maximum?: number | undefined;
  customMessages: {
    int?: string | undefined;
    min?: string | undefined;
    max?: string | undefined;
  };
}

/**
 * Schema type for number validation
 */
export class NumberType extends BaseType<number> {
  private options: NumberTypeOptions;

  constructor(options?: Partial<NumberTypeOptions>) {
    super();
    this.options = {
      customMessages: {},
      ...options,
    };
  }

  _parse(value: unknown, ctx: ParseContext): ParseResult<number> {
    if (
      typeof value !== "number" ||
      Number.isNaN(value) ||
      !Number.isFinite(value)
    ) {
      return this._createError(ctx, {
        code: "invalid_type",
        expected: "number",
        received: value === null ? "null" : typeof value,
      });
    }

    const { isInt, minimum, maximum, customMessages } = this.options;

    // Check integer
    if (isInt && !Number.isInteger(value)) {
      return this._createError(ctx, {
        code: "invalid_type",
        expected: "integer",
        received: "float",
        message: customMessages.int,
      });
    }

    // Check minimum
    if (minimum !== undefined && value < minimum) {
      return this._createError(ctx, {
        code: "too_small",
        minimum,
        expected: "number",
        message: customMessages.min,
      });
    }

    // Check maximum
    if (maximum !== undefined && value > maximum) {
      return this._createError(ctx, {
        code: "too_big",
        maximum,
        expected: "number",
        message: customMessages.max,
      });
    }

    return { success: true, data: value };
  }

  _clone(): NumberType {
    return new NumberType({
      isInt: this.options.isInt,
      minimum: this.options.minimum,
      maximum: this.options.maximum,
      customMessages: { ...this.options.customMessages },
    });
  }

  /**
   * Require integer value
   */
  int(opts?: ErrorMessageOptions): NumberType {
    const clone = this._clone();
    clone.options.isInt = true;
    if (opts?.message) {
      clone.options.customMessages.int = opts.message;
    }
    return clone;
  }

  /**
   * Set minimum value (inclusive)
   */
  min(value: number, opts?: ErrorMessageOptions): NumberType {
    const clone = this._clone();
    clone.options.minimum = value;
    if (opts?.message) {
      clone.options.customMessages.min = opts.message;
    }
    return clone;
  }

  /**
   * Set maximum value (inclusive)
   */
  max(value: number, opts?: ErrorMessageOptions): NumberType {
    const clone = this._clone();
    clone.options.maximum = value;
    if (opts?.message) {
      clone.options.customMessages.max = opts.message;
    }
    return clone;
  }

  /**
   * Require positive number (> 0)
   */
  positive(opts?: ErrorMessageOptions): NumberType {
    const clone = this._clone();
    clone.options.minimum = Number.MIN_VALUE;
    if (opts?.message) {
      clone.options.customMessages.min = opts.message;
    }
    return clone;
  }

  /**
   * Require negative number (< 0)
   */
  negative(opts?: ErrorMessageOptions): NumberType {
    const clone = this._clone();
    clone.options.maximum = -Number.MIN_VALUE;
    if (opts?.message) {
      clone.options.customMessages.max = opts.message;
    }
    return clone;
  }

  /**
   * Require non-negative number (>= 0)
   */
  nonnegative(opts?: ErrorMessageOptions): NumberType {
    return this.min(0, opts);
  }
}
