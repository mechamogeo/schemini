# Examples

This directory contains example code demonstrating how to use `@schemini/core`.

> **Note**: These examples show the import style after installing `@schemini/core` from npm.
> They are for documentation purposes and won't run directly in this monorepo.

## Examples

### 01-basic-usage.ts

Fundamental usage patterns including:

- Primitive types (string, number, boolean)
- String validators (email, uuid, date)
- Object and array schemas
- Literal and enum types
- Union types
- Modifiers (optional, nullable, default)
- Transform and refine
- Error handling
- Object utilities (pick, omit, partial, extend)

### 02-form-validation.ts

Form validation patterns including:

- Registration forms with coercion
- Contact and address forms
- Payment forms with Brazilian validators (CPF, CNPJ, CEP)
- Multi-step form validation
- Dynamic forms with conditional fields
- File upload validation
- Form error formatting

### 03-api-validation.ts

API validation patterns including:

- REST API request/response schemas
- Middleware pattern for validation
- Query parameter validation with coercion
- Webhook payload validation
- GraphQL-style input types
- Authentication endpoints
- Batch operations
- Rate limiting info parsing

### 04-json-schema.ts

JSON Schema integration including:

- Converting schemini to JSON Schema
- Converting JSON Schema to schemini
- Round-trip conversion
- OpenAPI integration
- Schema documentation generation
- Handling nullable/optional types
- Complex nested schemas
- Config file validation

## Running Examples Locally

To run these examples, you would:

1. Create a new project:

   ```bash
   mkdir my-project && cd my-project
   npm init -y
   ```

2. Install @schemini/core:

   ```bash
   npm install @schemini/core
   ```

3. Copy an example file and run it:
   ```bash
   npx tsx 01-basic-usage.ts
   ```
