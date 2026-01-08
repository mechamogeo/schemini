/**
 * Common validation patterns
 */
export const PATTERNS = {
  /**
   * Email pattern - simplified but effective
   */
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  /**
   * UUID v4 pattern
   */
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

  /**
   * ISO date pattern (YYYY-MM-DD)
   */
  date: /^\d{4}-\d{2}-\d{2}$/,

  /**
   * ISO datetime pattern (YYYY-MM-DDTHH:mm:ssZ or with timezone)
   */
  datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/,

  /**
   * Brazilian CEP pattern
   */
  cep: /^\d{5}-?\d{3}$/,
} as const;

export type PatternName = keyof typeof PATTERNS;
