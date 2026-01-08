import type { Issue } from './types';

/**
 * Format a path array into a readable string
 * e.g., ['user', 'profile', 0, 'name'] -> 'user.profile[0].name'
 */
function formatPath(path: (string | number)[]): string {
  if (path.length === 0) return '';

  return path.reduce<string>((acc, segment, index) => {
    if (typeof segment === 'number') {
      return `${acc}[${segment}]`;
    }
    return index === 0 ? segment : `${acc}.${segment}`;
  }, '');
}

/**
 * ValidationError is thrown when schema validation fails.
 * It contains an array of issues describing what went wrong.
 */
export class ValidationError extends Error {
  public readonly issues: Issue[];

  constructor(issues: Issue[]) {
    const message = ValidationError.formatMessage(issues);
    super(message);

    this.name = 'ValidationError';
    this.issues = issues;

    // Maintains proper stack trace for where error was thrown (only V8)
    if ('captureStackTrace' in Error && typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Format issues into a readable error message
   */
  private static formatMessage(issues: Issue[]): string {
    if (issues.length === 0) {
      return 'Validation failed';
    }

    if (issues.length === 1) {
      const issue = issues[0]!;
      const path = formatPath(issue.path);
      return path ? `${path}: ${issue.message}` : issue.message;
    }

    const lines = issues.map((issue) => {
      const path = formatPath(issue.path);
      return path ? `  - ${path}: ${issue.message}` : `  - ${issue.message}`;
    });

    return `${issues.length} validation errors:\n${lines.join('\n')}`;
  }

  /**
   * Make error JSON serializable
   */
  toJSON(): { name: string; message: string; issues: Issue[] } {
    return {
      name: this.name,
      message: this.message,
      issues: this.issues,
    };
  }
}
