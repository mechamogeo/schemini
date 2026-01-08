import { ArrayType } from '../types/array';
/**
 * Convert mini-schema schemas to JSON Schema
 */
import type { BaseType } from '../types/base';
import { DefaultType, NullableType, NullishType, OptionalType, TransformType } from '../types/base';
import { BooleanType } from '../types/boolean';
import { EnumType } from '../types/enum';
import { LiteralType } from '../types/literal';
import { NumberType } from '../types/number';
import { ObjectType } from '../types/object';
import { StringType } from '../types/string';
import { UnionType } from '../types/union';
import {
  JSON_SCHEMA_DRAFT,
  type JsonSchema,
  type JsonSchemaType,
  type ToJsonSchemaOptions,
} from './types';

/**
 * Convert a mini-schema type to JSON Schema
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for schema type compatibility
export function toJsonSchema(schema: BaseType<any>, options: ToJsonSchemaOptions = {}): JsonSchema {
  const result = convertSchema(schema);

  if (options.includeSchema) {
    result.$schema = JSON_SCHEMA_DRAFT;
  }

  if (options.$id) {
    result.$id = options.$id;
  }

  if (options.title) {
    result.title = options.title;
  }

  if (options.description) {
    result.description = options.description;
  }

  return result;
}

/**
 * Internal schema converter
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for schema type compatibility
function convertSchema(schema: BaseType<any>): JsonSchema {
  // Handle modifier types first (they wrap other types)
  if (schema instanceof OptionalType) {
    return convertOptionalType(schema);
  }

  if (schema instanceof NullableType) {
    return convertNullableType(schema);
  }

  if (schema instanceof NullishType) {
    return convertNullishType(schema);
  }

  if (schema instanceof DefaultType) {
    return convertDefaultType(schema);
  }

  if (schema instanceof TransformType) {
    return convertTransformType(schema);
  }

  // Handle concrete types
  if (schema instanceof StringType) {
    return convertStringType(schema);
  }

  if (schema instanceof NumberType) {
    return convertNumberType(schema);
  }

  if (schema instanceof BooleanType) {
    return { type: 'boolean' };
  }

  if (schema instanceof LiteralType) {
    return convertLiteralType(schema);
  }

  if (schema instanceof EnumType) {
    return convertEnumType(schema);
  }

  if (schema instanceof ObjectType) {
    return convertObjectType(schema);
  }

  if (schema instanceof ArrayType) {
    return convertArrayType(schema);
  }

  if (schema instanceof UnionType) {
    return convertUnionType(schema);
  }

  // Fallback - unknown schema type
  return {};
}

function convertStringType(schema: StringType): JsonSchema {
  const result: JsonSchema = { type: 'string' };

  // Access private options via type assertion
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private field
  const options = (schema as any).options;

  if (options) {
    if (options.minLength !== undefined) {
      result.minLength = options.minLength;
    }

    if (options.maxLength !== undefined) {
      result.maxLength = options.maxLength;
    }

    if (options.pattern) {
      result.pattern = options.pattern.source;
    }

    // Map format to JSON Schema format
    if (options.format) {
      switch (options.format) {
        case 'email':
          result.format = 'email';
          break;
        case 'uuid':
          result.format = 'uuid';
          break;
        case 'date':
          result.format = 'date';
          break;
        case 'datetime':
          result.format = 'date-time';
          break;
      }
    }
  }

  return result;
}

function convertNumberType(schema: NumberType): JsonSchema {
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private field
  const options = (schema as any).options;
  const result: JsonSchema = { type: options?.isInt ? 'integer' : 'number' };

  if (options) {
    if (options.minimum !== undefined) {
      result.minimum = options.minimum;
    }

    if (options.maximum !== undefined) {
      result.maximum = options.maximum;
    }
  }

  return result;
}

// biome-ignore lint/suspicious/noExplicitAny: Required for literal type compatibility
function convertLiteralType(schema: LiteralType<any>): JsonSchema {
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private field
  const value = (schema as any).value;
  return { const: value };
}

// biome-ignore lint/suspicious/noExplicitAny: Required for enum type compatibility
function convertEnumType(schema: EnumType<any>): JsonSchema {
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private field
  const options = (schema as any).options;
  return { enum: [...options] };
}

// biome-ignore lint/suspicious/noExplicitAny: Required for object type compatibility
function convertObjectType(schema: ObjectType<any>): JsonSchema {
  const result: JsonSchema = {
    type: 'object',
    properties: {},
    required: [],
  };

  const shape = schema.shape;

  for (const [key, propSchema] of Object.entries(shape)) {
    // biome-ignore lint/suspicious/noExplicitAny: Required for schema compatibility
    result.properties![key] = convertSchema(propSchema as BaseType<any>);

    // Check if property is required (not optional or default)
    if (!(propSchema instanceof OptionalType) && !(propSchema instanceof DefaultType)) {
      result.required!.push(key);
    }

    // Add default value if present
    if (propSchema instanceof DefaultType) {
      // biome-ignore lint/suspicious/noExplicitAny: Accessing private field
      const defaultValue = (propSchema as any).defaultValue;
      if (typeof defaultValue !== 'function') {
        result.properties![key].default = defaultValue;
      }
    }
  }

  // Remove empty required array
  if (result.required!.length === 0) {
    delete result.required;
  }

  return result;
}

// biome-ignore lint/suspicious/noExplicitAny: Required for array type compatibility
function convertArrayType(schema: ArrayType<any>): JsonSchema {
  // ArrayType uses 'element' as public field name
  // biome-ignore lint/suspicious/noExplicitAny: Accessing field
  const elementType = (schema as any).element;

  const result: JsonSchema = {
    type: 'array',
    items: convertSchema(elementType),
  };

  // ArrayType uses _minLength and _maxLength directly, not options
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private field
  const minLength = (schema as any)._minLength;
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private field
  const maxLength = (schema as any)._maxLength;

  if (minLength !== undefined) {
    result.minItems = minLength;
  }

  if (maxLength !== undefined) {
    result.maxItems = maxLength;
  }

  return result;
}

// biome-ignore lint/suspicious/noExplicitAny: Required for union type compatibility
function convertUnionType(schema: UnionType<any>): JsonSchema {
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private field
  const options = (schema as any).options;

  return {
    anyOf: options.map(convertSchema),
  };
}

// biome-ignore lint/suspicious/noExplicitAny: Required for type compatibility
function convertOptionalType(schema: OptionalType<any>): JsonSchema {
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private field
  const innerType = (schema as any).innerType;
  return convertSchema(innerType);
}

/**
 * Helper to add null to a type array
 */
function addNullToType(innerSchema: JsonSchema): JsonSchema {
  if (innerSchema.type !== undefined) {
    const baseTypes: JsonSchemaType[] = Array.isArray(innerSchema.type)
      ? innerSchema.type
      : [innerSchema.type];
    const newTypes: JsonSchemaType[] = [...baseTypes, 'null'];

    // Create a new object without spreading to avoid exactOptionalPropertyTypes issues
    const result: JsonSchema = { type: newTypes };

    // Copy over other properties
    if (innerSchema.minLength !== undefined) result.minLength = innerSchema.minLength;
    if (innerSchema.maxLength !== undefined) result.maxLength = innerSchema.maxLength;
    if (innerSchema.pattern !== undefined) result.pattern = innerSchema.pattern;
    if (innerSchema.format !== undefined) result.format = innerSchema.format;
    if (innerSchema.minimum !== undefined) result.minimum = innerSchema.minimum;
    if (innerSchema.maximum !== undefined) result.maximum = innerSchema.maximum;
    if (innerSchema.enum !== undefined) result.enum = innerSchema.enum;
    if (innerSchema.const !== undefined) result.const = innerSchema.const;

    return result;
  }
  return { anyOf: [innerSchema, { type: 'null' }] };
}

// biome-ignore lint/suspicious/noExplicitAny: Required for type compatibility
function convertNullableType(schema: NullableType<any>): JsonSchema {
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private field
  const innerType = (schema as any).innerType;
  const innerSchema = convertSchema(innerType);
  return addNullToType(innerSchema);
}

// biome-ignore lint/suspicious/noExplicitAny: Required for type compatibility
function convertNullishType(schema: NullishType<any>): JsonSchema {
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private field
  const innerType = (schema as any).innerType;
  const innerSchema = convertSchema(innerType);
  // undefined is not represented in JSON Schema, only add null
  return addNullToType(innerSchema);
}

// biome-ignore lint/suspicious/noExplicitAny: Required for type compatibility
function convertDefaultType(schema: DefaultType<any>): JsonSchema {
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private field
  const innerType = (schema as any).innerType;
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private field
  const defaultValue = (schema as any).defaultValue;

  const result = convertSchema(innerType);

  // Only add default if it's not a function
  if (typeof defaultValue !== 'function') {
    result.default = defaultValue;
  }

  return result;
}

// biome-ignore lint/suspicious/noExplicitAny: Required for type compatibility
function convertTransformType(schema: TransformType<any, any>): JsonSchema {
  // biome-ignore lint/suspicious/noExplicitAny: Accessing private field
  const innerType = (schema as any).innerType;
  // Transforms don't affect JSON Schema, just convert the inner type
  return convertSchema(innerType);
}
