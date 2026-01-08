// mini-schema - TypeScript-first schema validation
export const VERSION = '0.1.0';

// Schema factory
export { s, schema } from './schema';

// Types
export {
  BaseType,
  type SafeParseOptions,
  OptionalType,
  NullableType,
  NullishType,
  DefaultType,
  TransformType,
  StringType,
  NumberType,
  BooleanType,
  LiteralType,
  type LiteralValue,
  EnumType,
  ObjectType,
  type Shape,
  type InferShape,
  ArrayType,
  UnionType,
  CoercedStringType,
  CoercedNumberType,
  CoercedBooleanType,
  type Infer,
  type InferInput,
  type InferTuple,
  type InferUnion,
} from './types';

// Errors
export { ValidationError, getErrorMessage, defaultErrorMap } from './errors';
export type {
  Issue,
  IssueCode,
  ParseContext,
  ParseResult,
  ErrorMapFn,
  ErrorMessageOptions,
} from './errors/types';

// Validators
export {
  PATTERNS,
  type PatternName,
  isValidCPF,
  isValidCNPJ,
  isValidCEP,
  isValidCurrency,
  parseCurrency,
  formatCurrency,
  type CurrencyOptions,
  type CurrencyParseResult,
  isValidPhone,
  parsePhone,
  formatPhone,
  type PhoneOptions,
  type PhoneParseResult,
  type CountryCode,
  type E164Number,
  type NumberFormat,
  type PhoneNumber,
} from './validators';
