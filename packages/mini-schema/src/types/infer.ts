/**
 * Type inference utilities for mini-schema
 */
import type { BaseType } from './base';

/**
 * Infer the output type from a schema
 *
 * @example
 * const userSchema = s.object({
 *   name: s.string(),
 *   age: s.number(),
 * });
 *
 * type User = Infer<typeof userSchema>;
 * // { name: string; age: number }
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for type inference from any schema
export type Infer<T extends BaseType<any>> = T['_output'];

/**
 * Infer the input type from a schema
 * This is useful for schemas with transforms where input differs from output
 *
 * @example
 * const schema = s.string().transform(s => s.length);
 * type Input = InferInput<typeof schema>; // string
 * type Output = Infer<typeof schema>; // number
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for type inference from any schema
export type InferInput<T extends BaseType<any>> = T['_input'];

/**
 * Infer output types from an array of schemas
 *
 * @example
 * const schemas = [s.string(), s.number()] as const;
 * type Types = InferTuple<typeof schemas>; // [string, number]
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
export type InferTuple<T extends readonly BaseType<any>[]> = {
  [K in keyof T]: T[K] extends BaseType<infer U> ? U : never;
};

/**
 * Infer the union of output types from an array of schemas
 *
 * @example
 * const schemas = [s.string(), s.number()] as const;
 * type Union = InferUnion<typeof schemas>; // string | number
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
export type InferUnion<T extends readonly BaseType<any>[]> = T[number]['_output'];
