import type { ValidationError } from '../errors';
import type { ParseContext, ParseResult } from '../errors/types';
import { BaseType, type DefaultType, OptionalType } from './base';

/**
 * Shape definition for object schemas
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for type compatibility with modifiers
export type Shape = Record<string, BaseType<any>>;

/**
 * Infer the output type from a shape
 * Handles required, optional, and default fields correctly with exactOptionalPropertyTypes
 */
export type InferShape<T extends Shape> = {
  // Required fields (not OptionalType or DefaultType)
  [K in keyof T as T[K] extends OptionalType<unknown> | DefaultType<unknown>
    ? never
    : K]: T[K]['_output'];
} & {
  // Optional fields (OptionalType) - marked with ? and | undefined for exactOptionalPropertyTypes
  [K in keyof T as T[K] extends OptionalType<unknown> ? K : never]?: T[K]['_output'] | undefined;
} & {
  // Default fields - optional in input but always present in output
  [K in keyof T as T[K] extends DefaultType<unknown> ? K : never]?: T[K]['_output'] | undefined;
};

/**
 * Flatten intersection types for better display
 */
type Flatten<T> = { [K in keyof T]: T[K] };

/**
 * Behavior for unknown keys
 */
type UnknownKeysBehavior = 'strip' | 'strict' | 'passthrough';

/**
 * Schema type for object validation
 */
export class ObjectType<T extends Shape> extends BaseType<Flatten<InferShape<T>>> {
  readonly shape: T;
  private unknownKeys: UnknownKeysBehavior = 'strip';

  constructor(shape: T, unknownKeys: UnknownKeysBehavior = 'strip') {
    super();
    this.shape = shape;
    this.unknownKeys = unknownKeys;
  }

  _parse(value: unknown, ctx: ParseContext): ParseResult<Flatten<InferShape<T>>> {
    // Check if value is an object
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return this._createError(ctx, {
        code: 'invalid_type',
        expected: 'object',
        received: value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value,
      });
    }

    const input = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    const errors: ValidationError[] = [];

    // Validate each property in the shape
    for (const [key, schema] of Object.entries(this.shape)) {
      const propValue = input[key];
      const propCtx: ParseContext = {
        ...ctx,
        path: [...ctx.path, key],
      };

      const propResult = schema._parse(propValue, propCtx);

      if (!propResult.success) {
        errors.push(propResult.error);
      } else if (propResult.data !== undefined) {
        result[key] = propResult.data;
      }
    }

    // Handle unknown keys
    if (this.unknownKeys === 'strict' || this.unknownKeys === 'passthrough') {
      const shapeKeys = new Set(Object.keys(this.shape));
      const unknownKeysFound = Object.keys(input).filter((k) => !shapeKeys.has(k));

      if (this.unknownKeys === 'strict' && unknownKeysFound.length > 0) {
        return this._createError(ctx, {
          code: 'unrecognized_keys',
          message: `Unrecognized keys: ${unknownKeysFound.join(', ')}`,
        });
      }

      if (this.unknownKeys === 'passthrough') {
        for (const key of unknownKeysFound) {
          result[key] = input[key];
        }
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: this._mergeErrors(errors),
      };
    }

    return { success: true, data: result as Flatten<InferShape<T>> };
  }

  /**
   * Reject objects with unknown keys
   */
  strict(): ObjectType<T> {
    return new ObjectType(this.shape, 'strict');
  }

  /**
   * Allow and pass through unknown keys
   */
  passthrough(): ObjectType<T> {
    return new ObjectType(this.shape, 'passthrough');
  }

  /**
   * Strip unknown keys (default behavior)
   */
  strip(): ObjectType<T> {
    return new ObjectType(this.shape, 'strip');
  }

  /**
   * Extend the schema with additional properties
   */
  extend<U extends Shape>(additional: U): ObjectType<T & U> {
    return new ObjectType({ ...this.shape, ...additional } as T & U, this.unknownKeys);
  }

  /**
   * Pick specific properties from the schema
   */
  pick<K extends keyof T>(...keys: K[]): ObjectType<Pick<T, K>> {
    const picked: Partial<T> = {};
    for (const key of keys) {
      picked[key] = this.shape[key];
    }
    return new ObjectType(picked as Pick<T, K>, this.unknownKeys);
  }

  /**
   * Omit specific properties from the schema
   */
  omit<K extends keyof T>(...keys: K[]): ObjectType<Omit<T, K>> {
    const omitted: Partial<T> = { ...this.shape };
    for (const key of keys) {
      delete omitted[key];
    }
    return new ObjectType(omitted as Omit<T, K>, this.unknownKeys);
  }

  /**
   * Make all properties optional
   */
  partial(): ObjectType<{
    [K in keyof T]: OptionalType<T[K]['_output']>;
  }> {
    const partialShape: Record<string, BaseType<unknown>> = {};
    for (const [key, schema] of Object.entries(this.shape)) {
      partialShape[key] = schema.optional();
    }
    return new ObjectType(
      partialShape as {
        [K in keyof T]: OptionalType<T[K]['_output']>;
      },
      this.unknownKeys,
    );
  }

  /**
   * Make all properties required (unwrap optional)
   */
  required(): ObjectType<{
    [K in keyof T]: T[K] extends OptionalType<infer U> ? BaseType<U> : T[K];
  }> {
    const requiredShape: Record<string, BaseType<unknown>> = {};
    for (const [key, schema] of Object.entries(this.shape)) {
      if (schema instanceof OptionalType) {
        // Access the inner type - we need to create a wrapper that validates non-undefined
        requiredShape[key] = new RequiredWrapper(schema);
      } else {
        requiredShape[key] = schema;
      }
    }
    return new ObjectType(
      requiredShape as {
        [K in keyof T]: T[K] extends OptionalType<infer U> ? BaseType<U> : T[K];
      },
      this.unknownKeys,
    );
  }
}

/**
 * Helper type to make an optional type required
 */
class RequiredWrapper<T> extends BaseType<T> {
  constructor(private readonly innerOptional: OptionalType<T>) {
    super();
  }

  _parse(value: unknown, ctx: ParseContext): ParseResult<T> {
    if (value === undefined) {
      return this._createError(ctx, {
        code: 'invalid_type',
        expected: 'value',
        received: 'undefined',
      });
    }
    // Parse through the optional (which will accept the value)
    const result = this.innerOptional._parse(value, ctx);
    if (!result.success) {
      return result as ParseResult<T>;
    }
    return { success: true, data: result.data as T };
  }
}
