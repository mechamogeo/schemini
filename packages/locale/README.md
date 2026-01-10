<p align="center">
  <img src="./assets/logo.svg" alt="schemini" height="66">
</p>

# @schemini/locale

Internationalization (i18n) support for [@schemini/core](https://www.npmjs.com/package/@schemini/core).

## Installation

```bash
npm install @schemini/locale
# or
pnpm add @schemini/locale
# or
yarn add @schemini/locale
```

## Usage

```typescript
import { s, setErrorMap } from "@schemini/core";
import { ptBR } from "@schemini/locale/pt-BR";

// Set Portuguese (Brazil) as the error language
setErrorMap(ptBR);

// Now all validation errors are in Portuguese
const schema = s.string().min(5);
const result = schema.safeParse("abc");

if (!result.success) {
  console.log(result.error.issues[0].message);
  // "A string deve ter pelo menos 5 caractere(s)"
}
```

## Available Locales

| Locale | Import Path              | Language            |
| ------ | ------------------------ | ------------------- |
| `ptBR` | `@schemini/locale/pt-BR` | Portuguese (Brazil) |

## Contributing a New Locale

1. Create a new file in `src/` (e.g., `es.ts` for Spanish)
2. Export an error map function following the `ErrorMap` type from `@schemini/core`
3. Add the export to `src/index.ts`
4. Update `tsup.config.ts` to include the new entry point
5. Submit a pull request

### Example Locale File

```typescript
import type { ErrorMap } from "@schemini/core";

export const es: ErrorMap = (issue) => {
  switch (issue.code) {
    case "invalid_type":
      return `Se esperaba ${issue.expected}, se recibio ${issue.received}`;
    case "too_small":
      if (issue.type === "string") {
        return `La cadena debe tener al menos ${issue.minimum} caractere(s)`;
      }
    // ... handle other types
    // ... handle other codes
    default:
      return issue.message;
  }
};
```

## License

MIT

## Documentation

**[Full i18n documentation →](https://github.com/mechamogeo/schemini/wiki/Internationalization)**

