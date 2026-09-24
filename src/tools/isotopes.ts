import { finishValidation, formatDecimal } from 'react-cheminfo/core';

import { formulaText } from '../chemistry/formula.ts';
import type { TwoIsotopeElement } from '../chemistry/isotopes.ts';
import {
  TWO_ISOTOPE_ELEMENTS,
  lighterAbundance,
} from '../chemistry/isotopes.ts';
import { parseNumber } from '../exercises/answers.ts';
import { emptyCase, unreadableCase } from '../exercises/cases.ts';
import type {
  AnswerCheck,
  AnswerField,
  Answers,
  FieldCase,
  SeriesTool,
} from '../exercises/types.ts';

/** How far from the true abundance an answer may be, in percentage points. */
export const ABUNDANCE_TOLERANCE = 1;

/** The decimals isotopic and atomic masses are shown with. */
export const MASS_DECIMALS = 4;

/** Work out the natural abundances of an element with two stable isotopes. */
export const ISOTOPES_TOOL: SeriesTool<TwoIsotopeElement> = {
  id: 'isotopes',
  pool: TWO_ISOTOPE_ELEMENTS,
  key: (element) => element.symbol,
  fields: isotopeFields,
  grade: gradeIsotopes,
  hints: isotopeHints,
  solution: isotopeSolution,
};

/**
 * The two boxes of an abundance question, one per isotope.
 * @param element - The element asked about.
 * @returns The lighter isotope's box, then the heavier one's.
 */
export function isotopeFields(element: TwoIsotopeElement): AnswerField[] {
  const [lighter, heavier] = element.isotopes;
  return [
    {
      key: 'lighter',
      label: `${isotopeLabel(lighter.massNumber, element.symbol)} (%)`,
      placeholder: 'abundance in %',
    },
    {
      key: 'heavier',
      label: `${isotopeLabel(heavier.massNumber, element.symbol)} (%)`,
      placeholder: 'abundance in %',
    },
  ];
}

/**
 * Grade the two abundances, each to within {@link ABUNDANCE_TOLERANCE} points
 * of the one the masses give.
 * @param element - The element asked about.
 * @param answers - What the student typed, keyed `lighter` and `heavier`.
 * @returns One case per isotope.
 */
export function gradeIsotopes(
  element: TwoIsotopeElement,
  answers: Answers,
): AnswerCheck {
  const expected = expectedAbundances(element);
  const [lighterField, heavierField] = isotopeFields(element);
  const cases: FieldCase[] = [];
  const pairs: Array<[AnswerField | undefined, number, number]> = [
    [lighterField, expected.lighter, expected.heavier],
    [heavierField, expected.heavier, expected.lighter],
  ];
  for (const [field, own, other] of pairs) {
    if (field === undefined) continue;
    cases.push(abundanceCase(field, answers[field.key] ?? '', own, other));
  }
  return finishValidation(cases);
}

/**
 * Hints for an abundance question, from the definition to the equation filled in.
 * @param element - The element asked about.
 * @returns Three hints.
 */
export function isotopeHints(element: TwoIsotopeElement): string[] {
  const [lighter, heavier] = element.isotopes;
  const first = isotopeLabel(lighter.massNumber, element.symbol);
  const second = isotopeLabel(heavier.massNumber, element.symbol);
  return [
    'The [[atomic mass]] is the mean of the isotopic masses, each weighted by its [[abundance]]. The two abundances add up to 100 %.',
    `Call x the share of ${first}: then M = x · m(${first}) + (1 − x) · m(${second}), with one unknown.`,
    `x = (${mass(heavier.mass)} − ${mass(element.atomicMass)}) / (${mass(heavier.mass)} − ${mass(lighter.mass)}).`,
  ];
}

/**
 * The worked abundances.
 * @param element - The element asked about.
 * @returns The equation solved, and both abundances.
 */
export function isotopeSolution(element: TwoIsotopeElement): string {
  const [lighter, heavier] = element.isotopes;
  const expected = expectedAbundances(element);
  const first = isotopeLabel(lighter.massNumber, element.symbol);
  const second = isotopeLabel(heavier.massNumber, element.symbol);
  return `x = (${mass(heavier.mass)} − ${mass(element.atomicMass)}) / (${mass(heavier.mass)} − ${mass(lighter.mass)}) = ${formatDecimal(expected.lighter / 100, 4)}, so **${first}: ${percent(expected.lighter)} %** and **${second}: ${percent(expected.heavier)} %**.`;
}

/**
 * The abundances the shown masses give, the heavier one as the rest of 100.
 * @param element - The element asked about.
 * @returns Both abundances, in percent.
 */
export function expectedAbundances(element: TwoIsotopeElement): {
  lighter: number;
  heavier: number;
} {
  const [lighterIsotope, heavierIsotope] = element.isotopes;
  const lighter = lighterAbundance(
    element.atomicMass,
    lighterIsotope.mass,
    heavierIsotope.mass,
  );
  return { lighter, heavier: 100 - lighter };
}

/**
 * An isotope written as a chemist writes it, e.g. `³⁵Cl`.
 * @param massNumber - Its mass number.
 * @param symbol - Its element.
 * @returns The label.
 */
export function isotopeLabel(massNumber: number, symbol: string): string {
  return formulaText(`[${massNumber}${symbol}]`);
}

function abundanceCase(
  field: AnswerField,
  typed: string,
  expected: number,
  other: number,
): FieldCase {
  if (typed.trim() === '') return emptyCase(field.label, 'an abundance in %');
  const value = parseNumber(typed);
  if (value === null) return unreadableCase(field.label, typed, 'a number');
  const passed = Math.abs(value - expected) <= ABUNDANCE_TOLERANCE;
  let reason = `Right: ${percent(expected)} %.`;
  if (!passed) {
    if (value > 0 && value <= 1 && expected > 1) {
      reason = `${typed.trim()} looks like a fraction; the box asks for a percentage.`;
    } else if (Math.abs(value - other) <= ABUNDANCE_TOLERANCE) {
      reason = 'That is the other isotope’s abundance: the two are swapped.';
    } else {
      reason = `${typed.trim()} % is more than ${ABUNDANCE_TOLERANCE} point away from what the masses give.`;
    }
  }
  return { label: field.label, passed, reason, actual: typed };
}

function mass(value: number): string {
  return formatDecimal(value, MASS_DECIMALS);
}

function percent(value: number): string {
  return formatDecimal(value, 2);
}
