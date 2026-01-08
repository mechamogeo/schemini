import { StringType } from "./types/string";
import { NumberType } from "./types/number";
import { BooleanType } from "./types/boolean";

/**
 * Schema factory - main entry point for creating schemas
 */
export const s = {
  /**
   * Create a string schema
   */
  string: () => new StringType(),

  /**
   * Create a number schema
   */
  number: () => new NumberType(),

  /**
   * Create a boolean schema
   */
  boolean: () => new BooleanType(),
} as const;

export { s as schema };
