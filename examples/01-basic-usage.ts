/**
 * Basic Usage Examples
 *
 * This file demonstrates the fundamental usage patterns of @schemini/core.
 */

import { s, ValidationError } from "@schemini/core";

// ============================================================================
// 1. Primitive Types
// ============================================================================

// String validation
const nameSchema = s.string().min(1).max(100);
console.log(nameSchema.parse("John")); // 'John'

// Number validation
const ageSchema = s.number().int().min(0).max(150);
console.log(ageSchema.parse(30)); // 30

// Boolean validation
const activeSchema = s.boolean();
console.log(activeSchema.parse(true)); // true

// ============================================================================
// 2. String Validators
// ============================================================================

const emailSchema = s.string().email();
const uuidSchema = s.string().uuid();
const dateSchema = s.string().date(); // YYYY-MM-DD format
const datetimeSchema = s.string().datetime(); // ISO 8601

console.log(emailSchema.parse("user@example.com"));
console.log(uuidSchema.parse("123e4567-e89b-12d3-a456-426614174000"));
console.log(dateSchema.parse("2024-01-15"));

// ============================================================================
// 3. Object Schemas
// ============================================================================

const userSchema = s.object({
  id: s.number().int().positive(),
  name: s.string().min(1),
  email: s.string().email(),
  age: s.number().int().positive().optional(),
  isActive: s.boolean().default(true),
});

// Infer the type from the schema
type User = s.infer<typeof userSchema>;

const user: User = userSchema.parse({
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  age: 30,
});

console.log(user);
// { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, isActive: true }

// ============================================================================
// 4. Array Schemas
// ============================================================================

const tagsSchema = s.array(s.string().min(1)).min(1).max(10);
console.log(tagsSchema.parse(["typescript", "validation"]));

const numbersSchema = s.array(s.number()).nonempty();
console.log(numbersSchema.parse([1, 2, 3]));

// ============================================================================
// 5. Literal and Enum Types
// ============================================================================

// Literal - exact value
const statusLiteral = s.literal("active");
console.log(statusLiteral.parse("active")); // 'active'

// Enum - one of several values
const roleSchema = s.enum(["admin", "user", "guest"] as const);
type Role = s.infer<typeof roleSchema>; // 'admin' | 'user' | 'guest'
console.log(roleSchema.parse("admin"));

// ============================================================================
// 6. Union Types
// ============================================================================

const stringOrNumber = s.union([s.string(), s.number()]);
console.log(stringOrNumber.parse("hello")); // 'hello'
console.log(stringOrNumber.parse(42)); // 42

// ============================================================================
// 7. Modifiers
// ============================================================================

const configSchema = s.object({
  name: s.string(), // required
  description: s.string().optional(), // string | undefined
  enabled: s.boolean().nullable(), // boolean | null
  timeout: s.number().nullish(), // number | null | undefined
  retries: s.number().default(3), // defaults to 3 if undefined
});

// ============================================================================
// 8. Transform
// ============================================================================

const trimmedString = s.string().transform((val) => val.trim());
console.log(trimmedString.parse("  hello  ")); // 'hello'

const uppercaseEmail = s
  .string()
  .email()
  .transform((val) => val.toLowerCase());
console.log(uppercaseEmail.parse("USER@EXAMPLE.COM")); // 'user@example.com'

// ============================================================================
// 9. Custom Validation (refine)
// ============================================================================

const passwordSchema = s
  .string()
  .min(8)
  .refine((val) => /[A-Z]/.test(val), "Must contain uppercase letter")
  .refine((val) => /[0-9]/.test(val), "Must contain a number");

// ============================================================================
// 10. Error Handling
// ============================================================================

// Using parse() - throws on error
try {
  userSchema.parse({ id: "not a number", name: "", email: "invalid" });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log("Validation failed:");
    for (const issue of error.issues) {
      console.log(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
  }
}

// Using safeParse() - returns result object
const result = userSchema.safeParse({
  id: 1,
  name: "John",
  email: "john@example.com",
});
if (result.success) {
  console.log("Valid user:", result.data);
} else {
  console.log("Validation errors:", result.error.issues);
}

// ============================================================================
// 11. Object Utilities
// ============================================================================

const baseSchema = s.object({
  id: s.number(),
  name: s.string(),
  email: s.string().email(),
});

// Pick specific fields
const nameOnly = baseSchema.pick(["name"]);
type NameOnly = s.infer<typeof nameOnly>; // { name: string }

// Omit fields
const withoutEmail = baseSchema.omit(["email"]);
type WithoutEmail = s.infer<typeof withoutEmail>; // { id: number; name: string }

// Make all fields optional
const partialSchema = baseSchema.partial();
type Partial = s.infer<typeof partialSchema>; // { id?: number; name?: string; email?: string }

// Extend with new fields
const extendedSchema = baseSchema.extend({
  createdAt: s.string().datetime(),
});

// Strict mode - fail on unknown keys
const strictSchema = baseSchema.strict();

// Passthrough - keep unknown keys
const passthroughSchema = baseSchema.passthrough();
