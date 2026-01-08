import { ValidationError, getErrorMessage } from "../errors";
import type {
  Issue,
  IssueCode,
  ParseResult,
  ParseContext,
  ErrorMapFn,
} from "../errors/types";

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
   * Clone the type instance - must be implemented by subclasses
   */
  abstract _clone(): BaseType<TOutput, TInput>;

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
      message: "",
      expected: options.expected,
      received: options.received,
      minimum: options.minimum,
      maximum: options.maximum,
      inclusive: options.inclusive,
      options: options.options,
    };

    // Generate message using error map or custom message
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
}
