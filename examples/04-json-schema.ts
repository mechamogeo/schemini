/**
 * JSON Schema Examples
 *
 * Demonstrates bidirectional conversion between @schemini/core and JSON Schema.
 */

import {
  s,
  toJsonSchema,
  fromJsonSchema,
  type JsonSchema,
} from "@schemini/core";

// ============================================================================
// 1. Converting mini-schema to JSON Schema
// ============================================================================

const userSchema = s.object({
  id: s.number().int().positive(),
  name: s.string().min(1).max(100),
  email: s.string().email(),
  age: s.number().int().min(0).max(150).optional(),
  role: s.enum(["admin", "user", "guest"] as const),
  tags: s.array(s.string()).max(10),
  isActive: s.boolean().default(true),
});

// Convert to JSON Schema
const jsonSchema = s.toJsonSchema(userSchema);

console.log("Generated JSON Schema:");
console.log(JSON.stringify(jsonSchema, null, 2));

/*
Output:
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": { "type": "integer", "minimum": 1 },
    "name": { "type": "string", "minLength": 1, "maxLength": 100 },
    "email": { "type": "string", "format": "email", "pattern": "..." },
    "age": { "type": "integer", "minimum": 0, "maximum": 150 },
    "role": { "type": "string", "enum": ["admin", "user", "guest"] },
    "tags": { "type": "array", "items": { "type": "string" }, "maxItems": 10 },
    "isActive": { "type": "boolean", "default": true }
  },
  "required": ["id", "name", "email", "role", "tags"]
}
*/

// ============================================================================
// 2. Converting JSON Schema to mini-schema
// ============================================================================

const externalJsonSchema: JsonSchema = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 1, maxLength: 200 },
    content: { type: "string" },
    published: { type: "boolean" },
    views: { type: "integer", minimum: 0 },
    rating: { type: "number", minimum: 0, maximum: 5 },
    tags: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
    },
  },
  required: ["title", "content"],
};

// Create mini-schema from JSON Schema
const postSchema = s.fromJsonSchema(externalJsonSchema);

// Validate data
const result = postSchema.safeParse({
  title: "Hello World",
  content: "This is my first post",
  views: 100,
});

console.log("Validation result:", result.success);

// ============================================================================
// 3. Round-trip: mini-schema → JSON Schema → mini-schema
// ============================================================================

const originalSchema = s.object({
  name: s.string().min(1),
  age: s.number().int().positive(),
  email: s.string().email().optional(),
});

// Convert to JSON Schema
const json = s.toJsonSchema(originalSchema);

// Convert back to mini-schema
const recreatedSchema = s.fromJsonSchema(json);

// Both schemas validate the same data
const testData = { name: "John", age: 30, email: "john@example.com" };

console.log("Original validates:", originalSchema.safeParse(testData).success);
console.log(
  "Recreated validates:",
  recreatedSchema.safeParse(testData).success,
);

// ============================================================================
// 4. OpenAPI Integration Example
// ============================================================================

/**
 * Generate OpenAPI-compatible schema definitions
 */
function generateOpenAPISchemas(schemas: Record<string, unknown>) {
  const components: Record<string, JsonSchema> = {};

  for (const [name, schema] of Object.entries(schemas)) {
    if (
      typeof schema === "object" &&
      schema !== null &&
      "safeParse" in schema
    ) {
      // Remove $schema for OpenAPI compatibility
      const jsonSchema = s.toJsonSchema(
        schema as Parameters<typeof s.toJsonSchema>[0],
      );
      // biome-ignore lint/performance/noDelete: Intentional cleanup
      delete jsonSchema.$schema;
      components[name] = jsonSchema;
    }
  }

  return { components: { schemas: components } };
}

// Define your API schemas
const apiSchemas = {
  User: userSchema,
  CreateUserRequest: userSchema.omit(["id"]),
  UpdateUserRequest: userSchema.omit(["id"]).partial(),
  UserList: s.object({
    users: s.array(userSchema),
    total: s.number().int(),
  }),
};

const openAPIComponents = generateOpenAPISchemas(apiSchemas);
console.log("OpenAPI Components:");
console.log(JSON.stringify(openAPIComponents, null, 2));

// ============================================================================
// 5. Schema Documentation Generation
// ============================================================================

interface SchemaDoc {
  type: string;
  required: boolean;
  constraints: string[];
  nested?: Record<string, SchemaDoc>;
}

function documentSchema(jsonSchema: JsonSchema, required = true): SchemaDoc {
  const constraints: string[] = [];
  let type = String(jsonSchema.type ?? "unknown");

  if (jsonSchema.minLength !== undefined) {
    constraints.push(`minLength: ${jsonSchema.minLength}`);
  }
  if (jsonSchema.maxLength !== undefined) {
    constraints.push(`maxLength: ${jsonSchema.maxLength}`);
  }
  if (jsonSchema.minimum !== undefined) {
    constraints.push(`minimum: ${jsonSchema.minimum}`);
  }
  if (jsonSchema.maximum !== undefined) {
    constraints.push(`maximum: ${jsonSchema.maximum}`);
  }
  if (jsonSchema.pattern) {
    constraints.push(`pattern: ${jsonSchema.pattern}`);
  }
  if (jsonSchema.format) {
    constraints.push(`format: ${jsonSchema.format}`);
  }
  if (jsonSchema.enum) {
    constraints.push(`enum: [${jsonSchema.enum.join(", ")}]`);
  }
  if (jsonSchema.default !== undefined) {
    constraints.push(`default: ${JSON.stringify(jsonSchema.default)}`);
  }

  const doc: SchemaDoc = { type, required, constraints };

  if (jsonSchema.type === "object" && jsonSchema.properties) {
    doc.nested = {};
    const requiredFields = new Set(jsonSchema.required ?? []);
    for (const [key, value] of Object.entries(jsonSchema.properties)) {
      doc.nested[key] = documentSchema(
        value as JsonSchema,
        requiredFields.has(key),
      );
    }
  }

  if (jsonSchema.type === "array" && jsonSchema.items) {
    doc.nested = { items: documentSchema(jsonSchema.items as JsonSchema) };
    if (jsonSchema.minItems !== undefined) {
      constraints.push(`minItems: ${jsonSchema.minItems}`);
    }
    if (jsonSchema.maxItems !== undefined) {
      constraints.push(`maxItems: ${jsonSchema.maxItems}`);
    }
  }

  return doc;
}

const docs = documentSchema(s.toJsonSchema(userSchema));
console.log("Schema Documentation:");
console.log(JSON.stringify(docs, null, 2));

// ============================================================================
// 6. Handling nullable and optional types
// ============================================================================

const nullableSchema = s.object({
  requiredField: s.string(),
  optionalField: s.string().optional(),
  nullableField: s.string().nullable(),
  nullishField: s.string().nullish(),
});

const nullableJsonSchema = s.toJsonSchema(nullableSchema);
console.log("Nullable/Optional handling:");
console.log(JSON.stringify(nullableJsonSchema, null, 2));

// ============================================================================
// 7. Complex Nested Schemas
// ============================================================================

const orderSchema = s.object({
  id: s.string().uuid(),
  customer: s.object({
    id: s.number().int(),
    name: s.string(),
    email: s.string().email(),
    address: s.object({
      street: s.string(),
      city: s.string(),
      country: s.string(),
      zipCode: s.string(),
    }),
  }),
  items: s.array(
    s.object({
      productId: s.number().int(),
      name: s.string(),
      quantity: s.number().int().positive(),
      unitPrice: s.number().positive(),
    }),
  ),
  status: s.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ] as const),
  createdAt: s.string().datetime(),
});

const orderJsonSchema = s.toJsonSchema(orderSchema);
console.log("Complex nested schema:");
console.log(JSON.stringify(orderJsonSchema, null, 2));

// ============================================================================
// 8. Schema Validation for Config Files
// ============================================================================

// Define a config file schema
const configSchema = s.object({
  app: s.object({
    name: s.string().min(1),
    version: s.string().pattern(/^\d+\.\d+\.\d+$/),
    environment: s.enum(["development", "staging", "production"] as const),
  }),
  server: s.object({
    host: s.string().default("localhost"),
    port: s.number().int().min(1).max(65535).default(3000),
    cors: s
      .object({
        enabled: s.boolean().default(true),
        origins: s.array(s.string()).default(["*"]),
      })
      .optional(),
  }),
  database: s.object({
    url: s.string().min(1),
    pool: s.object({
      min: s.number().int().min(1).default(2),
      max: s.number().int().min(1).default(10),
    }),
  }),
  features: s
    .object({
      enableNewUI: s.boolean().default(false),
      maxUploadSize: s.number().int().positive().default(10485760),
    })
    .optional(),
});

// Export JSON Schema for IDE autocompletion (e.g., VSCode)
const configJsonSchema = s.toJsonSchema(configSchema);
console.log("Config file schema for IDE:");
console.log(JSON.stringify(configJsonSchema, null, 2));
