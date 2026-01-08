import type { ParseContext, ParseResult } from "../errors/types";
import { BaseType } from "./base";

/**
 * Infer output type from an array of schemas
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
type InferUnion<T extends readonly BaseType<any>[]> = T[number]["_output"];

/**
 * Schema type for union validation (accepts any of the provided schemas)
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
export class UnionType<T extends readonly BaseType<any>[]> extends BaseType<
  InferUnion<T>
> {
  readonly options: T;

  constructor(options: T) {
    super();
    this.options = options;
  }

  _parse(value: unknown, ctx: ParseContext): ParseResult<InferUnion<T>> {
    // Try each option in order
    for (const option of this.options) {
      const result = option._parse(value, ctx);
      if (result.success) {
        return result as ParseResult<InferUnion<T>>;
      }
    }

    // None matched - return invalid_union error
    return this._createError(ctx, {
      code: "invalid_union",
    });
  }
}
