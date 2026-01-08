import { describe, expect, it } from 'vitest';
import type { Issue } from '../../src/errors/types';
import { ValidationError } from '../../src/errors/validation-error';

describe('ValidationError', () => {
  it('should create error with issues array', () => {
    const issues: Issue[] = [
      {
        code: 'invalid_type',
        path: [],
        message: 'Expected string, received number',
        expected: 'string',
        received: 'number',
      },
    ];

    const error = new ValidationError(issues);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.issues).toHaveLength(1);
    expect(error.issues[0].code).toBe('invalid_type');
  });

  it('should format message from first issue', () => {
    const issues: Issue[] = [
      {
        code: 'invalid_type',
        path: [],
        message: 'Expected string, received number',
      },
    ];

    const error = new ValidationError(issues);

    expect(error.message).toContain('Expected string, received number');
  });

  it('should format message with path', () => {
    const issues: Issue[] = [
      {
        code: 'invalid_type',
        path: ['user', 'name'],
        message: 'Expected string',
      },
    ];

    const error = new ValidationError(issues);

    expect(error.message).toContain('user.name');
  });

  it('should handle multiple issues', () => {
    const issues: Issue[] = [
      { code: 'invalid_type', path: ['name'], message: 'Expected string' },
      { code: 'invalid_type', path: ['age'], message: 'Expected number' },
    ];

    const error = new ValidationError(issues);

    expect(error.issues).toHaveLength(2);
    expect(error.message).toContain('2 validation error');
  });

  it('should handle array index in path', () => {
    const issues: Issue[] = [
      {
        code: 'invalid_type',
        path: ['items', 0, 'name'],
        message: 'Expected string',
      },
    ];

    const error = new ValidationError(issues);

    expect(error.message).toContain('items[0].name');
  });

  it('should be serializable to JSON', () => {
    const issues: Issue[] = [{ code: 'invalid_type', path: ['name'], message: 'Expected string' }];

    const error = new ValidationError(issues);
    const json = JSON.parse(JSON.stringify(error));

    expect(json.issues).toBeDefined();
    expect(json.issues).toHaveLength(1);
  });
});
