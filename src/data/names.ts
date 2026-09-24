import { NAMES_EN } from './locales/en.ts';
import type { LocaleNames } from './locales/types.ts';

/**
 * The name a question shows for a compound, in the language the site speaks.
 * @param tool - The tool the question belongs to.
 * @param formula - The compound, as the tool's data writes it.
 * @returns Its name, or undefined when the data names none.
 */
export function compoundName(
  tool: keyof LocaleNames,
  formula: string,
): string | undefined {
  return NAMES_EN[tool][formula];
}
