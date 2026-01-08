import type { ErrorMapFn, Issue } from './types';

/**
 * Default error messages in English
 */
export const defaultErrorMap: ErrorMapFn = (issue: Issue): string => {
  switch (issue.code) {
    case 'invalid_type':
      return `Expected ${issue.expected ?? 'unknown'}, received ${issue.received ?? 'unknown'}`;

    case 'too_small': {
      const min = issue.minimum ?? 0;
      if (issue.expected === 'string') {
        return `String must contain at least ${min} character${min === 1 ? '' : 's'}`;
      }
      if (issue.expected === 'array') {
        return `Array must contain at least ${min} element${min === 1 ? '' : 's'}`;
      }
      return `Value must be greater than or equal to ${min}`;
    }

    case 'too_big': {
      const max = issue.maximum ?? 0;
      if (issue.expected === 'string') {
        return `String must contain at most ${max} character${max === 1 ? '' : 's'}`;
      }
      if (issue.expected === 'array') {
        return `Array must contain at most ${max} element${max === 1 ? '' : 's'}`;
      }
      return `Value must be less than or equal to ${max}`;
    }

    case 'invalid_string': {
      const format = issue.expected ?? 'format';
      return `Invalid ${format}`;
    }

    case 'invalid_enum': {
      const options = issue.options?.join(', ') ?? '';
      return `Invalid enum value. Expected ${options}, received '${issue.received ?? 'unknown'}'`;
    }

    case 'invalid_literal':
      return `Invalid literal value, expected ${issue.expected ?? 'unknown'}`;

    case 'invalid_union':
      return 'Invalid input';

    case 'unrecognized_keys':
      return 'Unrecognized keys in object';

    case 'invalid_date':
      return 'Invalid date';

    case 'custom':
      return issue.message || 'Validation failed';

    default:
      return 'Validation failed';
  }
};

/**
 * Current global error map
 */
let currentErrorMap: ErrorMapFn = defaultErrorMap;

/**
 * Set a custom error map globally
 */
export function setErrorMap(errorMap: ErrorMapFn): void {
  currentErrorMap = errorMap;
}

/**
 * Get the current error map
 */
export function getErrorMap(): ErrorMapFn {
  return currentErrorMap;
}

/**
 * Reset to default error map
 */
export function resetErrorMap(): void {
  currentErrorMap = defaultErrorMap;
}

/**
 * Generate error message using current error map or custom message
 */
export function getErrorMessage(issue: Issue, customMessage?: string): string {
  if (customMessage) {
    return customMessage;
  }
  return currentErrorMap(issue);
}
