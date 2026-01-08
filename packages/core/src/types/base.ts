import { ValidationError, getErrorMessage } from '../errors';
import type { ErrorMapFn, Issue, IssueCode, ParseContext, ParseResult } from '../errors/types';

/**
 * Options for creating an error issue
 */
interface CreateErrorOptions {
  code: IssueCode;
  expected?: string | undefined;
  received?: string | undefined;
  minimum?: number | undefined;
  maximum?: number | undefined;
  inclusive?: boolean | undefined;
  options?: string[] | undefined;
  message?: string | undefined;
}

/**
 * Options for safeParse method
 */
export interface SafeParseOptions {
  errorMap?: ErrorMapFn;
}

/**
 * Abstract base class for all schema types.
 * Provides common functionality for parsing and validation.
 */
export abstract class BaseType<TOutput, TInput = TOutput> {
  /**
   * Phantom type for output type inference
   */
  declare readonly _output: TOutput;

  /**
   * Phantom type for input type inference
   */
  declare readonly _input: TInput;

  /**
   * Internal parse method - must be implemented by subclasses
   */
  abstract _parse(value: unknown, ctx: ParseContext): ParseResult<TOutput>;

  /**
   * Parse a value and throw if invalid
   */
  parse(value: unknown): TOutput {
    const result = this.safeParse(value);
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  }

  /**
   * Parse a value and return a result object
   */
  safeParse(value: unknown, options?: SafeParseOptions): ParseResult<TOutput> {
    const ctx: ParseContext = {
      path: [],
      errorMap: options?.errorMap,
    };
    return this._parse(value, ctx);
  }

  /**
   * Helper to create an error result
   */
  protected _createError(
    ctx: ParseContext,
    options: CreateErrorOptions,
  ): { success: false; error: ValidationError } {
    const issue: Issue = {
      code: options.code,
      path: ctx.path,
      message: '',
      expected: options.expected,
      received: options.received,
      minimum: options.minimum,
      maximum: options.maximum,
      inclusive: options.inclusive,
      options: options.options,
    };

    // Generate message using error map or custom message
    // Priority: ctx.errorMap > options.message > global error map
    const errorMap = ctx.errorMap;
    if (errorMap) {
      issue.message = errorMap(issue);
    } else if (options.message) {
      issue.message = options.message;
    } else {
      issue.message = getErrorMessage(issue);
    }

    return {
      success: false,
      error: new ValidationError([issue]),
    };
  }

  /**
   * Helper to merge multiple error results
   */
  protected _mergeErrors(errors: ValidationError[]): ValidationError {
    const allIssues = errors.flatMap((e) => e.issues);
    return new ValidationError(allIssues);
  }

  /**
   * Make this schema optional (accept undefined)
   */
  optional(): OptionalType<TOutput> {
    return new OptionalType(this as unknown as BaseType<TOutput>);
  }

  /**
   * Make this schema nullable (accept null)
   */
  nullable(): NullableType<TOutput> {
    return new NullableType(this as unknown as BaseType<TOutput>);
  }

  /**
   * Make this schema nullish (accept null or undefined)
   */
  nullish(): NullishType<TOutput> {
    return new NullishType(this as unknown as BaseType<TOutput>);
  }

  /**
   * Provide a default value when undefined is passed
   */
  default(defaultValue: TOutput | (() => TOutput)): DefaultType<TOutput> {
    return new DefaultType(this as unknown as BaseType<TOutput>, defaultValue);
  }

  /**
   * Transform the output value
   */
  transform<TNewOutput>(fn: (value: TOutput) => TNewOutput): TransformType<TOutput, TNewOutput> {
    return new TransformType(this as unknown as BaseType<TOutput>, fn);
  }
}

/**
 * Wrapper type that makes the inner type optional
 */
export class OptionalType<T> extends BaseType<T | undefined> {
  constructor(private readonly innerType: BaseType<T>) {
    super();
  }

  _parse(value: unknown, ctx: ParseContext): ParseResult<T | undefined> {
    if (value === undefined) {
      return { success: true, data: undefined };
    }
    return this.innerType._parse(value, ctx) as ParseResult<T | undefined>;
  }
}

/**
 * Wrapper type that makes the inner type nullable
 */
export class NullableType<T> extends BaseType<T | null> {
  constructor(private readonly innerType: BaseType<T>) {
    super();
  }

  _parse(value: unknown, ctx: ParseContext): ParseResult<T | null> {
    if (value === null) {
      return { success: true, data: null };
    }
    return this.innerType._parse(value, ctx) as ParseResult<T | null>;
  }
}

/**
 * Wrapper type that makes the inner type nullish (null | undefined)
 */
export class NullishType<T> extends BaseType<T | null | undefined> {
  constructor(private readonly innerType: BaseType<T>) {
    super();
  }

  _parse(value: unknown, ctx: ParseContext): ParseResult<T | null | undefined> {
    if (value === undefined || value === null) {
      return { success: true, data: value as null | undefined };
    }
    return this.innerType._parse(value, ctx) as ParseResult<T | null | undefined>;
  }
}

/**
 * Wrapper type that provides a default value for undefined
 */
export class DefaultType<T> extends BaseType<T> {
  constructor(
    private readonly innerType: BaseType<T>,
    private readonly defaultValue: T | (() => T),
  ) {
    super();
  }

  _parse(value: unknown, ctx: ParseContext): ParseResult<T> {
    if (value === undefined) {
      const resolved =
        typeof this.defaultValue === 'function'
          ? (this.defaultValue as () => T)()
          : this.defaultValue;
      return { success: true, data: resolved };
    }
    return this.innerType._parse(value, ctx) as ParseResult<T>;
  }
}

/**
 * Wrapper type that transforms the output
 */
export class TransformType<TInput, TOutput> extends BaseType<TOutput> {
  constructor(
    private readonly innerType: BaseType<TInput>,
    private readonly transformFn: (value: TInput) => TOutput,
  ) {
    super();
  }

  _parse(value: unknown, ctx: ParseContext): ParseResult<TOutput> {
    const result = this.innerType._parse(value, ctx);
    if (!result.success) {
      return result as ParseResult<TOutput>;
    }
    const transformed = this.transformFn(result.data);
    return { success: true, data: transformed };
  }
}
