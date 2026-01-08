import { afterEach, describe, expect, it } from 'vitest';
import {
  defaultErrorMap,
  getErrorMap,
  resetErrorMap,
  setErrorMap,
} from '../../src/errors/messages';
import type { Issue } from '../../src/errors/types';

describe('Error Messages', () => {
  afterEach(() => {
    resetErrorMap();
  });

  describe('defaultErrorMap', () => {
    it('should format invalid_type error', () => {
      const issue: Issue = {
        code: 'invalid_type',
        path: [],
        message: '',
        expected: 'string',
        received: 'number',
      };

      const message = defaultErrorMap(issue);

      expect(message).toBe('Expected string, received number');
    });

    it('should format too_small error for string', () => {
      const issue: Issue = {
        code: 'too_small',
        path: [],
        message: '',
        minimum: 3,
        expected: 'string',
      };

      const message = defaultErrorMap(issue);

      expect(message).toContain('3');
      expect(message.toLowerCase()).toContain('character');
    });

    it('should format too_big error', () => {
      const issue: Issue = {
        code: 'too_big',
        path: [],
        message: '',
        maximum: 10,
        expected: 'string',
      };

      const message = defaultErrorMap(issue);

      expect(message).toContain('10');
    });

    it('should format invalid_string error', () => {
      const issue: Issue = {
        code: 'invalid_string',
        path: [],
        message: '',
        expected: 'email',
      };

      const message = defaultErrorMap(issue);

      expect(message.toLowerCase()).toContain('email');
    });

    it('should format invalid_enum error', () => {
      const issue: Issue = {
        code: 'invalid_enum',
        path: [],
        message: '',
        options: ['a', 'b', 'c'],
        received: 'd',
      };

      const message = defaultErrorMap(issue);

      expect(message).toContain('a');
      expect(message).toContain('b');
      expect(message).toContain('c');
    });

    it('should format custom error', () => {
      const issue: Issue = {
        code: 'custom',
        path: [],
        message: 'Custom validation failed',
      };

      const message = defaultErrorMap(issue);

      expect(message).toBe('Custom validation failed');
    });
  });

  describe('setErrorMap', () => {
    it('should allow setting custom error map', () => {
      const customMap = (issue: Issue) => `Custom: ${issue.code}`;

      setErrorMap(customMap);

      expect(getErrorMap()).toBe(customMap);
    });

    it('should use custom map for message generation', () => {
      const customMap = () => 'All errors are the same';

      setErrorMap(customMap);
      const currentMap = getErrorMap();

      const issue: Issue = {
        code: 'invalid_type',
        path: [],
        message: '',
      };

      expect(currentMap(issue)).toBe('All errors are the same');
    });
  });

  describe('resetErrorMap', () => {
    it('should reset to default error map', () => {
      setErrorMap(() => 'custom');
      resetErrorMap();

      expect(getErrorMap()).toBe(defaultErrorMap);
    });
  });
});
