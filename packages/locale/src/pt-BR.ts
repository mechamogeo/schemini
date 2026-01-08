import type { ErrorMapFn, Issue } from '@schemini/core';

/**
 * Brazilian Portuguese (pt-BR) error messages for schemini
 */
export const ptBR: ErrorMapFn = (issue: Issue): string => {
  switch (issue.code) {
    case 'invalid_type':
      return `Esperado ${translateType(issue.expected)}, recebido ${translateType(issue.received)}`;

    case 'too_small': {
      const min = issue.minimum ?? 0;
      if (issue.expected === 'string') {
        return `Texto deve conter pelo menos ${min} caractere${min === 1 ? '' : 's'}`;
      }
      if (issue.expected === 'array') {
        return `Array deve conter pelo menos ${min} elemento${min === 1 ? '' : 's'}`;
      }
      return `Valor deve ser maior ou igual a ${min}`;
    }

    case 'too_big': {
      const max = issue.maximum ?? 0;
      if (issue.expected === 'string') {
        return `Texto deve conter no máximo ${max} caractere${max === 1 ? '' : 's'}`;
      }
      if (issue.expected === 'array') {
        return `Array deve conter no máximo ${max} elemento${max === 1 ? '' : 's'}`;
      }
      return `Valor deve ser menor ou igual a ${max}`;
    }

    case 'invalid_string': {
      const format = issue.expected ?? 'formato';
      return `${translateFormat(format)} inválido`;
    }

    case 'invalid_enum': {
      const options = issue.options?.join(', ') ?? '';
      return `Valor inválido. Esperado ${options}, recebido '${issue.received ?? 'desconhecido'}'`;
    }

    case 'invalid_literal':
      return `Valor literal inválido, esperado ${issue.expected ?? 'desconhecido'}`;

    case 'invalid_union':
      return 'Entrada inválida';

    case 'unrecognized_keys':
      return 'Chaves não reconhecidas no objeto';

    case 'invalid_date':
      return 'Data inválida';

    case 'custom':
      return issue.message || 'Validação falhou';

    default:
      return 'Validação falhou';
  }
};

/**
 * Translate type names to Portuguese
 */
function translateType(type: string | undefined): string {
  if (!type) return 'desconhecido';

  const translations: Record<string, string> = {
    string: 'texto',
    number: 'número',
    integer: 'inteiro',
    float: 'decimal',
    boolean: 'booleano',
    array: 'array',
    object: 'objeto',
    null: 'nulo',
    undefined: 'indefinido',
    unknown: 'desconhecido',
  };

  return translations[type] ?? type;
}

/**
 * Translate format names to Portuguese
 */
function translateFormat(format: string): string {
  const translations: Record<string, string> = {
    email: 'E-mail',
    uuid: 'UUID',
    date: 'Data',
    datetime: 'Data/hora',
    url: 'URL',
    format: 'Formato',
    cpf: 'CPF',
    cnpj: 'CNPJ',
    cep: 'CEP',
    phone: 'Telefone',
    currency: 'Moeda',
  };

  return translations[format] ?? format;
}
