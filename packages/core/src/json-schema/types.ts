/**
 * JSON Schema types and utilities for mini-schema
 * Supports JSON Schema Draft 2020-12
 */

/**
 * JSON Schema primitive types
 */
export type JsonSchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null';

/**
 * JSON Schema string format
 */
export type JsonSchemaFormat =
  | 'date-time'
  | 'date'
  | 'time'
  | 'email'
  | 'uri'
  | 'uuid'
  | 'regex'
  | 'ipv4'
  | 'ipv6'
  | string;

/**
 * JSON Schema definition
 */
export interface JsonSchema {
  // Meta
  $schema?: string;
  $id?: string;
  $ref?: string;
  $defs?: Record<string, JsonSchema>;
  title?: string;
  description?: string;
  default?: unknown;
  examples?: unknown[];
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;

  // Type
  type?: JsonSchemaType | JsonSchemaType[];
  const?: unknown;
  enum?: unknown[];

  // String
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: JsonSchemaFormat;

  // Number
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;

  // Array
  items?: JsonSchema;
  prefixItems?: JsonSchema[];
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  contains?: JsonSchema;
  minContains?: number;
  maxContains?: number;

  // Object
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  propertyNames?: JsonSchema;
  minProperties?: number;
  maxProperties?: number;
  patternProperties?: Record<string, JsonSchema>;
  dependentRequired?: Record<string, string[]>;
  dependentSchemas?: Record<string, JsonSchema>;

  // Composition
  allOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  not?: JsonSchema;
  if?: JsonSchema;
  then?: JsonSchema;
  else?: JsonSchema;
}

/**
 * Options for JSON Schema generation
 */
export interface ToJsonSchemaOptions {
  /**
   * Include $schema meta field
   */
  includeSchema?: boolean;
  /**
   * Schema ID
   */
  $id?: string;
  /**
   * Schema title
   */
  title?: string;
  /**
   * Schema description
   */
  description?: string;
}

/**
 * Default JSON Schema draft version
 */
export const JSON_SCHEMA_DRAFT = 'https://json-schema.org/draft/2020-12/schema';
