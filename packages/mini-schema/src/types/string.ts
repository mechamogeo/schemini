import type { ErrorMessageOptions, ParseContext, ParseResult } from '../errors/types';
import { PATTERNS, isValidCEP, isValidCNPJ, isValidCPF } from '../validators';
import { BaseType } from './base';

type StringFormat = 'email' | 'uuid' | 'date' | 'datetime' | 'cep' | 'cpf' | 'cnpj';

interface StringTypeOptions {
  minLength?: number | undefined;
  maxLength?: number | undefined;
  pattern?: RegExp | undefined;
  format?: StringFormat | undefined;
  customValidators: Array<{
    validate: (value: string) => boolean;
    message?: string | undefined;
  }>;
  customMessages: {
    min?: string | undefined;
    max?: string | undefined;
    pattern?: string | undefined;
  };
}

/**
 * Schema type for string validation
 */
export class StringType extends BaseType<string> {
  private options: StringTypeOptions;

  constructor(options?: Partial<StringTypeOptions>) {
    super();
    this.options = {
      customValidators: [],
      customMessages: {},
      ...options,
    };
  }

  _parse(value: unknown, ctx: ParseContext): ParseResult<string> {
    if (typeof value !== 'string') {
      return this._createError(ctx, {
        code: 'invalid_type',
        expected: 'string',
        received: value === null ? 'null' : typeof value,
      });
    }

    const { minLength, maxLength, pattern, customValidators, customMessages } = this.options;

    // Check min length
    if (minLength !== undefined && value.length < minLength) {
      return this._createError(ctx, {
        code: 'too_small',
        minimum: minLength,
        expected: 'string',
        message: customMessages.min,
      });
    }

    // Check max length
    if (maxLength !== undefined && value.length > maxLength) {
      return this._createError(ctx, {
        code: 'too_big',
        maximum: maxLength,
        expected: 'string',
        message: customMessages.max,
      });
    }

    // Check pattern
    if (pattern && !pattern.test(value)) {
      return this._createError(ctx, {
        code: 'invalid_string',
        expected: this.options.format ?? 'pattern',
        message: customMessages.pattern,
      });
    }

    // Run custom validators
    for (const validator of customValidators) {
      if (!validator.validate(value)) {
        return this._createError(ctx, {
          code: 'custom',
          message: validator.message,
        });
      }
    }

    return { success: true, data: value };
  }

  _clone(): StringType {
    return new StringType({
      minLength: this.options.minLength,
      maxLength: this.options.maxLength,
      pattern: this.options.pattern,
      format: this.options.format,
      customValidators: [...this.options.customValidators],
      customMessages: { ...this.options.customMessages },
    });
  }

  /**
   * Set minimum string length
   */
  min(length: number, opts?: ErrorMessageOptions): StringType {
    const clone = this._clone();
    clone.options.minLength = length;
    if (opts?.message) {
      clone.options.customMessages.min = opts.message;
    }
    return clone;
  }

  /**
   * Set maximum string length
   */
  max(length: number, opts?: ErrorMessageOptions): StringType {
    const clone = this._clone();
    clone.options.maxLength = length;
    if (opts?.message) {
      clone.options.customMessages.max = opts.message;
    }
    return clone;
  }

  /**
   * Set exact string length
   */
  length(length: number, opts?: ErrorMessageOptions): StringType {
    return this.min(length, opts).max(length, opts);
  }

  /**
   * Validate against a regex pattern
   */
  pattern(regex: RegExp, opts?: ErrorMessageOptions): StringType {
    const clone = this._clone();
    clone.options.pattern = regex;
    if (opts?.message) {
      clone.options.customMessages.pattern = opts.message;
    }
    return clone;
  }

  /**
   * Validate as email address
   */
  email(opts?: ErrorMessageOptions): StringType {
    const clone = this.pattern(PATTERNS.email, opts);
    clone.options.format = 'email';
    return clone;
  }

  /**
   * Validate as UUID
   */
  uuid(opts?: ErrorMessageOptions): StringType {
    const clone = this.pattern(PATTERNS.uuid, opts);
    clone.options.format = 'uuid';
    return clone;
  }

  /**
   * Validate as ISO date (YYYY-MM-DD)
   */
  date(opts?: ErrorMessageOptions): StringType {
    const clone = this.pattern(PATTERNS.date, opts);
    clone.options.format = 'date';
    return clone;
  }

  /**
   * Validate as ISO datetime
   */
  datetime(opts?: ErrorMessageOptions): StringType {
    const clone = this.pattern(PATTERNS.datetime, opts);
    clone.options.format = 'datetime';
    return clone;
  }

  /**
   * Require non-empty string
   */
  nonempty(opts?: ErrorMessageOptions): StringType {
    return this.min(1, opts);
  }

  /**
   * Add custom validator
   */
  refine(validate: (value: string) => boolean, opts?: ErrorMessageOptions): StringType {
    const clone = this._clone();
    clone.options.customValidators.push({
      validate,
      message: opts?.message,
    });
    return clone;
  }

  /**
   * Validate as Brazilian CPF (Cadastro de Pessoas Físicas)
   * Accepts both formatted (XXX.XXX.XXX-XX) and unformatted (XXXXXXXXXXX) CPFs
   */
  cpf(opts?: ErrorMessageOptions): StringType {
    const clone = this._clone();
    clone.options.format = 'cpf';
    clone.options.customValidators.push({
      validate: isValidCPF,
      message: opts?.message ?? 'Invalid CPF',
    });
    return clone;
  }

  /**
   * Validate as Brazilian CNPJ (Cadastro Nacional da Pessoa Jurídica)
   * Accepts both formatted (XX.XXX.XXX/XXXX-XX) and unformatted (XXXXXXXXXXXXXX) CNPJs
   */
  cnpj(opts?: ErrorMessageOptions): StringType {
    const clone = this._clone();
    clone.options.format = 'cnpj';
    clone.options.customValidators.push({
      validate: isValidCNPJ,
      message: opts?.message ?? 'Invalid CNPJ',
    });
    return clone;
  }

  /**
   * Validate as Brazilian CEP (Código de Endereçamento Postal)
   * Accepts both formatted (XXXXX-XXX) and unformatted (XXXXXXXX) CEPs
   */
  cep(opts?: ErrorMessageOptions): StringType {
    const clone = this._clone();
    clone.options.format = 'cep';
    clone.options.customValidators.push({
      validate: isValidCEP,
      message: opts?.message ?? 'Invalid CEP',
    });
    return clone;
  }
}
