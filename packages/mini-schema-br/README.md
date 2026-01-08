# mini-schema-br

Brazilian Portuguese (pt-BR) error messages for [mini-schema](https://www.npmjs.com/package/mini-schema).

## Installation

```bash
npm install mini-schema mini-schema-br
```

## Usage

```typescript
import { s, setErrorMap } from "mini-schema";
import { ptBRErrorMap } from "mini-schema-br";

// Set Portuguese error messages globally
setErrorMap(ptBRErrorMap);

// Now all validation errors are in Portuguese
const result = s.string().email().safeParse("invalid");
console.log(result.error?.issues[0]?.message);
// "Formato de email inválido"

const numberResult = s.number().min(10).safeParse(5);
console.log(numberResult.error?.issues[0]?.message);
// "Valor deve ser maior ou igual a 10"
```

## Supported Error Codes

All mini-schema error codes are translated:

| Code                     | Portuguese Message                          |
| ------------------------ | ------------------------------------------- |
| `invalid_type`           | "Esperado {expected}, recebido {received}"  |
| `too_small` (string)     | "Texto deve ter no mínimo {min} caracteres" |
| `too_big` (string)       | "Texto deve ter no máximo {max} caracteres" |
| `too_small` (number)     | "Valor deve ser maior ou igual a {min}"     |
| `too_big` (number)       | "Valor deve ser menor ou igual a {max}"     |
| `invalid_string` (email) | "Formato de email inválido"                 |
| `invalid_string` (uuid)  | "Formato de UUID inválido"                  |
| `invalid_string` (cpf)   | "CPF inválido"                              |
| `invalid_string` (cnpj)  | "CNPJ inválido"                             |
| `invalid_string` (cep)   | "CEP inválido"                              |
| `invalid_string` (phone) | "Número de telefone inválido"               |
| `invalid_enum`           | "Valor inválido. Esperado: {options}"       |
| `invalid_literal`        | "Valor inválido. Esperado: {expected}"      |
| `invalid_union`          | "Entrada inválida"                          |
| `unrecognized_keys`      | "Chaves não reconhecidas: {keys}"           |
| `custom`                 | Custom message or "Validação falhou"        |

## Exports

```typescript
import { ptBRErrorMap, portugueseErrorMap } from "mini-schema-br";

// Both are the same - use whichever you prefer
setErrorMap(ptBRErrorMap);
setErrorMap(portugueseErrorMap);
```

## Resetting to English

```typescript
import { resetErrorMap } from "mini-schema";

// Reset to default English messages
resetErrorMap();
```

## License

MIT - Geovani Perez França
