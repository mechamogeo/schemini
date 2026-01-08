import { StringType } from "./types/string";

/**
 * Schema factory - main entry point for creating schemas
 */
export const s = {
  /**
   * Create a string schema
   */
  string: () => new StringType(),
} as const;

export { s as schema };
