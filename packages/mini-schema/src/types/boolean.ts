import { BaseType } from "./base";
import type { ParseResult, ParseContext } from "../errors/types";

/**
 * Schema type for boolean validation
 */
export class BooleanType extends BaseType<boolean> {
  _parse(value: unknown, ctx: ParseContext): ParseResult<boolean> {
    if (typeof value !== "boolean") {
      return this._createError(ctx, {
        code: "invalid_type",
        expected: "boolean",
        received: value === null ? "null" : typeof value,
      });
    }

    return { success: true, data: value };
  }

  _clone(): BooleanType {
    return new BooleanType();
  }
}
