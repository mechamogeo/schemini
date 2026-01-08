/**
 * Issue codes for validation errors
 */
export type IssueCode =
  | "invalid_type"
  | "too_small"
  | "too_big"
  | "invalid_string"
  | "invalid_enum"
  | "invalid_literal"
  | "invalid_union"
  | "unrecognized_keys"
  | "invalid_arguments"
  | "invalid_return_type"
  | "invalid_date"
  | "custom";

/**
 * Represents a single validation issue
 */
export interface Issue {
  code: IssueCode;
  path: (string | number)[];
  message: string;
  expected?: string;
  received?: string;
  minimum?: number;
  maximum?: number;
  inclusive?: boolean;
  exact?: boolean;
  options?: string[];
}

/**
 * Function type for custom error message generation
 */
export type ErrorMapFn = (issue: Issue) => string;

/**
 * Options for custom error messages
 */
export interface ErrorMessageOptions {
  message?: string;
}

/**
 * Result type for safeParse
 */
export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: import("./validation-error").ValidationError };

/**
 * Context passed during parsing
 */
export interface ParseContext {
  path: (string | number)[];
  errorMap?: ErrorMapFn;
}
