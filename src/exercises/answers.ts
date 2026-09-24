/**
 * Read a number the way a student types it: `42`, `+5`, `−3` with a real minus
 * sign, `1,5` with a decimal comma, `75.8 %`.
 * @param text - What was typed.
 * @returns The number, or null when the text is not one.
 */
export function parseNumber(text: string): number | null {
  const cleaned = text
    .trim()
    .replaceAll(/[−–]/gu, '-')
    .replace(/\s*%$/u, '')
    .replaceAll(/\s/gu, '')
    .replace(',', '.');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/iu.test(cleaned)) {
    return null;
  }
  return Number(cleaned);
}

/**
 * Read a whole number the way a student types it.
 * @param text - What was typed.
 * @returns The integer, or null when the text is not a whole number.
 */
export function parseInteger(text: string): number | null {
  const value = parseNumber(text);
  return value !== null && Number.isInteger(value) ? value : null;
}

/**
 * Write a signed whole number the way an oxidation state is written: `+5`,
 * `−2`, `0`.
 * @param value - The number.
 * @returns The number with its sign, and a true minus sign.
 */
export function formatSigned(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `−${-value}`;
  return '0';
}
