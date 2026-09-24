import type { FieldCase } from './types.ts';

/**
 * The verdict on a field left empty.
 * @param label - The field, as its box labels it.
 * @param what - What the box asks for, e.g. `a number of electrons`.
 * @returns A failed case that says what to type.
 */
export function emptyCase(label: string, what: string): FieldCase {
  return {
    label,
    passed: false,
    reason: `Type ${what}.`,
    actual: null,
  };
}

/**
 * The verdict on a field that does not read as the kind of value it asks for.
 * @param label - The field, as its box labels it.
 * @param typed - What was typed.
 * @param what - What the box asks for, e.g. `a whole number`.
 * @returns A failed case quoting what was typed.
 */
export function unreadableCase(
  label: string,
  typed: string,
  what: string,
): FieldCase {
  return {
    label,
    passed: false,
    reason: `“${typed.trim()}” is not ${what}.`,
    actual: typed,
  };
}
