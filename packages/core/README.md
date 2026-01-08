# @schemini/core

[![CI](https://github.com/mechamogeo/schemini/actions/workflows/ci.yml/badge.svg)](https://github.com/mechamogeo/schemini/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@schemini/core.svg)](https://www.npmjs.com/package/@schemini/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, TypeScript-first schema validation library with JSON Schema support.

## Features

- **TypeScript-first** - Full type inference with `s.infer<>`
- **Zero dependencies** - Lightweight core (~15KB)
- **JSON Schema support** - Bidirectional conversion to/from JSON Schema
- **Brazilian validators** - CPF, CNPJ, CEP validation built-in
- **Coercion** - Automatic type conversion for form data
- **Extensible** - Custom validators with `refine()` and `transform()`

## Installation

```bash
npm install @schemini/core
```

For Portuguese error messages:

```bash
npm install @schemini/locale
```

## Quick Start

```typescript
import { s } from "@schemini/core";

// Define a schema
const userSchema = s.object({
  name: s.string().min(1).max(100),
  email: s.string().email(),
  age: s.number().int().positive().optional(),
});

// Infer the type
type User = s.infer<typeof userSchema>;

// Parse data (throws on error)
const user = userSchema.parse({
  name: "John Doe",
  email: "john@example.com",
  age: 30,
});

// Safe parse (returns result object)
const result = userSchema.safeParse(data);
if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error.issues);
}
```

## Available Types

```typescript
// Primitives
s.string()    // String with .min(), .max(), .email(), .uuid(), .pattern()
s.number()    // Number with .int(), .min(), .max(), .positive(), .negative()
s.boolean()   // Boolean

// Complex
s.object({})  // Object with .pick(), .omit(), .partial(), .extend()
s.array()     // Array with .min(), .max(), .nonempty()
s.union([])   // Union types
s.literal()   // Literal values
s.enum([])    // Enum values

// Brazilian Validators
s.string().cpf()      // CPF validation
s.string().cnpj()     // CNPJ validation
s.string().cep()      // CEP validation
s.string().phone()    // Phone validation
s.string().currency() // Currency format

// Modifiers
.optional()   // T | undefined
.nullable()   // T | null
.default()    // Default value
.transform()  // Transform output
.refine()     // Custom validation
```

## JSON Schema

```typescript
// Convert to JSON Schema
const jsonSchema = s.toJsonSchema(userSchema);

// Convert from JSON Schema
const schema = s.fromJsonSchema(jsonSchema);
```

## Comparison with Zod

| Feature              | schemini | Zod    |
| -------------------- | -------- | ------ |
| Type inference       | Yes      | Yes    |
| JSON Schema support  | Built-in | Plugin |
| Brazilian validators | Built-in | No     |
| Bundle size          | ~15KB    | ~50KB  |

## Documentation

**[Full documentation →](https://github.com/mechamogeo/schemini/wiki)**

- [Getting Started](https://github.com/mechamogeo/schemini/wiki/Getting-Started)
- [API Reference](https://github.com/mechamogeo/schemini/wiki/API-Reference)
- [JSON Schema](https://github.com/mechamogeo/schemini/wiki/JSON-Schema)
- [Brazilian Validators](https://github.com/mechamogeo/schemini/wiki/Brazilian-Validators)
- [Error Handling](https://github.com/mechamogeo/schemini/wiki/Error-Handling)

## License

MIT
