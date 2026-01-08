# @schemini/core

[![CI](https://github.com/mechamogeo/schemini/actions/workflows/ci.yml/badge.svg)](https://github.com/mechamogeo/schemini/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@schemini%2Fcore.svg)](https://www.npmjs.com/package/@schemini/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, TypeScript-first schema validation library with JSON Schema support. Built for type safety, developer experience, and educational purposes.

## Features

- **TypeScript-first** - Full type inference with `s.infer<>`
- **Zero dependencies** (except optional libphonenumber-js for phone validation)
- **JSON Schema support** - Bidirectional conversion to/from JSON Schema
- **Brazilian validators** - CPF, CNPJ, CEP validation built-in
- **Coercion** - Automatic type conversion for form data
- **Extensible** - Custom validators with `refine()` and `transform()`
- **i18n ready** - Customizable error messages with `@schemini/locale` for Portuguese

## Installation

```bash
npm install @schemini/core
# or
pnpm add @schemini/core
# or
yarn add @schemini/core
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

## API Reference

### Primitive Types

```typescript
// String
s.string()
  .min(1) // Minimum length
  .max(100) // Maximum length
  .length(10) // Exact length
  .nonempty() // Alias for min(1)
  .pattern(/regex/) // Custom regex
  .email() // Email format
  .uuid() // UUID format
  .date() // YYYY-MM-DD format
  .datetime(); // ISO 8601 datetime

// Number
s.number()
  .int() // Integer only
  .min(0) // Minimum value
  .max(100) // Maximum value
  .positive() // > 0
  .negative() // < 0
  .nonnegative(); // >= 0

// Boolean
s.boolean();
```

### Brazilian Validators

```typescript
s.string().cpf(); // Brazilian CPF (e.g., "529.982.247-25")
s.string().cnpj(); // Brazilian CNPJ
s.string().cep(); // Brazilian ZIP code
s.string().phone(); // International phone (uses libphonenumber-js)
s.string().currency(); // Currency format (e.g., "R$ 1.234,56")
```

### Literal and Enum

```typescript
// Literal - exact value
const status = s.literal("active");
type Status = s.infer<typeof status>; // 'active'

// Enum - one of several values
const role = s.enum(["admin", "user", "guest"] as const);
type Role = s.infer<typeof role>; // 'admin' | 'user' | 'guest'
```

### Objects

```typescript
const userSchema = s.object({
  name: s.string(),
  email: s.string().email(),
});

// Object utilities
userSchema.pick(["name"]); // { name: string }
userSchema.omit(["email"]); // { name: string }
userSchema.partial(); // All fields optional
userSchema.required(); // All fields required
userSchema.extend({ age: s.number() }); // Add new fields
userSchema.strict(); // Fail on unknown keys
userSchema.passthrough(); // Keep unknown keys
```

### Arrays

```typescript
const tags = s
  .array(s.string())
  .min(1) // Minimum length
  .max(10) // Maximum length
  .length(5) // Exact length
  .nonempty(); // Alias for min(1)
```

### Union

```typescript
const stringOrNumber = s.union([s.string(), s.number()]);
type StringOrNumber = s.infer<typeof stringOrNumber>; // string | number
```

### Modifiers

```typescript
s.string().optional(); // string | undefined
s.string().nullable(); // string | null
s.string().nullish(); // string | null | undefined
s.string().default(""); // Defaults to '' if undefined
```

### Transform

```typescript
const trimmed = s.string().transform((val) => val.trim());
const lowercase = s
  .string()
  .email()
  .transform((val) => val.toLowerCase());
```

### Custom Validation

```typescript
const password = s
  .string()
  .min(8)
  .refine((val) => /[A-Z]/.test(val), "Must contain uppercase")
  .refine((val) => /[0-9]/.test(val), "Must contain number");
```

### Coercion

For form data where everything comes as strings:

```typescript
const formSchema = s.object({
  age: s.coerce.number().int().min(0), // "25" → 25
  active: s.coerce.boolean(), // "true" → true
  count: s.coerce.string(), // 123 → "123"
});
```

## JSON Schema Support

### Convert to JSON Schema

```typescript
import { s } from "@schemini/core";

const userSchema = s.object({
  name: s.string().min(1),
  email: s.string().email(),
  age: s.number().int().optional(),
});

const jsonSchema = s.toJsonSchema(userSchema);
// {
//   "$schema": "https://json-schema.org/draft/2020-12/schema",
//   "type": "object",
//   "properties": {
//     "name": { "type": "string", "minLength": 1 },
//     "email": { "type": "string", "format": "email", "pattern": "..." },
//     "age": { "type": "integer" }
//   },
//   "required": ["name", "email"]
// }
```

### Convert from JSON Schema

```typescript
const jsonSchema = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 1 },
    count: { type: "integer", minimum: 0 },
  },
  required: ["title"],
};

const schema = s.fromJsonSchema(jsonSchema);
const result = schema.parse({ title: "Hello", count: 42 });
```

## Error Handling

```typescript
import { s, ValidationError } from "@schemini/core";

try {
  userSchema.parse(invalidData);
} catch (error) {
  if (error instanceof ValidationError) {
    for (const issue of error.issues) {
      console.log(`${issue.path.join(".")}: ${issue.message}`);
    }
  }
}

// Or use safeParse
const result = userSchema.safeParse(data);
if (!result.success) {
  result.error.issues.forEach((issue) => {
    console.log(issue.path, issue.message, issue.code);
  });
}
```

## Internationalization (i18n)

### Using Portuguese (Brazilian) Messages

```typescript
import { s, setErrorMap } from "@schemini/core";
import { ptBR } from "@schemini/locale/pt-BR";

// Set globally
setErrorMap(ptBR);

// Now all validation errors are in Portuguese
const result = s.string().email().safeParse("invalid");
// result.error.issues[0].message → "E-mail inválido"
```

### Custom Error Messages

```typescript
import { setErrorMap, type ErrorMapFn } from "@schemini/core";

const customErrorMap: ErrorMapFn = (issue) => {
  switch (issue.code) {
    case "invalid_type":
      return `Expected ${issue.expected}, got ${issue.received}`;
    case "too_small":
      return `Must be at least ${issue.minimum}`;
    // ... handle other codes
    default:
      return "Validation failed";
  }
};

setErrorMap(customErrorMap);
```

## Comparison with Zod

| Feature              | schemini | Zod    |
| -------------------- | -------- | ------ |
| Type inference       | Yes      | Yes    |
| JSON Schema support  | Built-in | Plugin |
| Brazilian validators | Built-in | No     |
| Bundle size          | ~15KB    | ~50KB  |
| Async validation     | No       | Yes    |
| Recursive schemas    | No       | Yes    |
| Discriminated unions | No       | Yes    |

schemini is designed to be a lighter alternative for common use cases while providing unique features like Brazilian validators and built-in JSON Schema support.

## Standalone Validators

You can also use the validators directly:

```typescript
import {
  isValidCPF,
  isValidCNPJ,
  isValidCEP,
  isValidPhone,
  parseCurrency,
  formatPhone,
} from "@schemini/core/validators";

isValidCPF("529.982.247-25"); // true
isValidCNPJ("11.222.333/0001-81"); // true
isValidCEP("01310-100"); // true

parseCurrency("R$ 1.234,56"); // { valid: true, value: 1234.56 }
formatPhone("+5511999999999", "NATIONAL"); // '(11) 99999-9999'
```

## TypeScript

schemini requires TypeScript 5.0+ for best type inference. Recommended tsconfig:

```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## License

MIT

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting a PR.
