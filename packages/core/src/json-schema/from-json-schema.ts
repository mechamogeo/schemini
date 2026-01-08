import { ArrayType } from '../types/array';
/**
 * Convert JSON Schema to mini-schema schemas
 */
import type { BaseType } from '../types/base';
import { BooleanType } from '../types/boolean';
import { EnumType } from '../types/enum';
import { LiteralType } from '../types/literal';
import { NumberType } from '../types/number';
import { ObjectType, type Shape } from '../types/object';
import { StringType } from '../types/string';
import { UnionType } from '../types/union';
import type { JsonSchema, JsonSchemaType } from './types';

/**
 * Convert a JSON Schema to a mini-schema type
 *
 * Note: This is a best-effort conversion. Some JSON Schema features
 * may not be fully supported.
 */
// biome-ignore lint/suspicious/noExplicitAny: Return type depends on schema
export function fromJsonSchema(jsonSchema: JsonSchema): BaseType<any> {
  // Handle const (literal)
  if (jsonSchema.const !== undefined) {
    return new LiteralType(jsonSchema.const as string | number | boolean);
  }

  // Handle enum
  if (jsonSchema.enum !== undefined) {
    return new EnumType(jsonSchema.enum as [string | number, ...(string | number)[]]);
  }

  // Handle anyOf (union)
  if (jsonSchema.anyOf !== undefined) {
    return new UnionType(
      jsonSchema.anyOf.map(fromJsonSchema) as [
        // biome-ignore lint/suspicious/noExplicitAny: Required for union type
        BaseType<any>,
        // biome-ignore lint/suspicious/noExplicitAny: Required for union type
        ...BaseType<any>[],
      ],
    );
  }

  // Handle oneOf (union - treated same as anyOf for now)
  if (jsonSchema.oneOf !== undefined) {
    return new UnionType(
      jsonSchema.oneOf.map(fromJsonSchema) as [
        // biome-ignore lint/suspicious/noExplicitAny: Required for union type
        BaseType<any>,
        // biome-ignore lint/suspicious/noExplicitAny: Required for union type
        ...BaseType<any>[],
      ],
    );
  }

  // Handle type
  const schemaType = jsonSchema.type;

  if (schemaType === undefined) {
    // No type specified, return a permissive string schema
    return new StringType();
  }

  // Handle array of types (union)
  if (Array.isArray(schemaType)) {
    return handleArrayType(schemaType, jsonSchema);
  }

  // Handle single type
  return handleSingleType(schemaType, jsonSchema);
}

function handleArrayType(
  types: JsonSchemaType[],
  jsonSchema: JsonSchema,
  // biome-ignore lint/suspicious/noExplicitAny: Return type depends on schema
): BaseType<any> {
  const nonNullTypes = types.filter((t) => t !== 'null');

  if (nonNullTypes.length === 0) {
    // Only null type
    return new LiteralType(null as unknown as string);
  }

  if (nonNullTypes.length === 1) {
    // Single type with null - create the type and make it nullable
    const singleType = nonNullTypes[0]!;
    const innerSchema = handleSingleType(singleType, jsonSchema);
    return types.includes('null') ? innerSchema.nullable() : innerSchema;
  }

  // Multiple types - create a union
  const schemas = nonNullTypes.map((t) => handleSingleType(t, jsonSchema));

  // If null was in the types, make the union nullable
  if (types.includes('null')) {
    return new UnionType(
      schemas as [
        // biome-ignore lint/suspicious/noExplicitAny: Required for union type
        BaseType<any>,
        // biome-ignore lint/suspicious/noExplicitAny: Required for union type
        ...BaseType<any>[],
      ],
    ).nullable();
  }

  return new UnionType(
    schemas as [
      // biome-ignore lint/suspicious/noExplicitAny: Required for union type
      BaseType<any>,
      // biome-ignore lint/suspicious/noExplicitAny: Required for union type
      ...BaseType<any>[],
    ],
  );
}

function handleSingleType(
  type: JsonSchemaType,
  jsonSchema: JsonSchema,
  // biome-ignore lint/suspicious/noExplicitAny: Return type depends on schema
): BaseType<any> {
  switch (type) {
    case 'string':
      return convertToStringType(jsonSchema);

    case 'number':
      return convertToNumberType(jsonSchema, false);

    case 'integer':
      return convertToNumberType(jsonSchema, true);

    case 'boolean':
      return new BooleanType();

    case 'object':
      return convertToObjectType(jsonSchema);

    case 'array':
      return convertToArrayType(jsonSchema);

    case 'null':
      // null type - use a literal null
      return new LiteralType(null as unknown as string);

    default:
      // Unknown type, fallback to string
      return new StringType();
  }
}

function convertToStringType(schema: JsonSchema): StringType {
  let result = new StringType();

  if (schema.minLength !== undefined) {
    result = result.min(schema.minLength);
  }

  if (schema.maxLength !== undefined) {
    result = result.max(schema.maxLength);
  }

  if (schema.pattern !== undefined) {
    result = result.pattern(new RegExp(schema.pattern));
  }

  // Handle format
  if (schema.format !== undefined) {
    switch (schema.format) {
      case 'email':
        result = result.email();
        break;
      case 'uuid':
        result = result.uuid();
        break;
      case 'date':
        result = result.date();
        break;
      case 'date-time':
        result = result.datetime();
        break;
    }
  }

  return result;
}

function convertToNumberType(schema: JsonSchema, isInteger: boolean): NumberType {
  let result = new NumberType();

  if (isInteger) {
    result = result.int();
  }

  if (schema.minimum !== undefined) {
    result = result.min(schema.minimum);
  }

  if (schema.maximum !== undefined) {
    result = result.max(schema.maximum);
  }

  return result;
}

function convertToObjectType(schema: JsonSchema): ObjectType<Shape> {
  const shape: Shape = {};
  const requiredFields = new Set(schema.required ?? []);

  if (schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      let propType = fromJsonSchema(propSchema);

      // Make optional if not in required
      if (!requiredFields.has(key)) {
        propType = propType.optional();
      }

      // Add default value if present
      if (propSchema.default !== undefined) {
        propType = propType.default(propSchema.default);
      }

      shape[key] = propType;
    }
  }

  return new ObjectType(shape);
}

function convertToArrayType(schema: JsonSchema): ArrayType<unknown> {
  // biome-ignore lint/suspicious/noExplicitAny: Required for array element type
  let elementType: BaseType<any>;

  if (schema.items) {
    elementType = fromJsonSchema(schema.items);
  } else {
    // No items schema, default to string
    elementType = new StringType();
  }

  let result = new ArrayType(elementType);

  if (schema.minItems !== undefined) {
    result = result.min(schema.minItems);
  }

  if (schema.maxItems !== undefined) {
    result = result.max(schema.maxItems);
  }

  return result;
}
