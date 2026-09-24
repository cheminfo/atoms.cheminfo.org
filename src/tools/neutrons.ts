import { finishValidation } from 'react-cheminfo/core';

import { formulaText } from '../chemistry/formula.ts';
import type { NeutronCount } from '../chemistry/particles.ts';
import { countNeutrons } from '../chemistry/particles.ts';
import { NEUTRON_FORMULAS } from '../data/neutrons.ts';
import { parseInteger } from '../exercises/answers.ts';
import { emptyCase, unreadableCase } from '../exercises/cases.ts';
import type { AnswerCheck, Answers, SeriesTool } from '../exercises/types.ts';

const FIELD = 'neutrons';
const LABEL = 'Neutrons';

/** Count the neutrons of a formula whose every atom names its isotope. */
export const NEUTRONS_TOOL: SeriesTool<string> = {
  id: 'neutrons',
  pool: NEUTRON_FORMULAS,
  key: (formula) => formula,
  fields: () => [{ key: FIELD, label: LABEL, placeholder: 'e.g. 6' }],
  grade: gradeNeutrons,
  hints: neutronHints,
  solution: neutronSolution,
};

/**
 * Grade a neutron count.
 * @param formula - The isotopic formula asked about.
 * @param answers - What the student typed.
 * @returns One case, whose reason names the usual slip when it recognises one.
 */
export function gradeNeutrons(formula: string, answers: Answers): AnswerCheck {
  const typed = answers[FIELD] ?? '';
  if (typed.trim() === '') {
    return finishValidation([emptyCase(LABEL, 'a number of neutrons')]);
  }
  const value = parseInteger(typed);
  if (value === null) {
    return finishValidation([unreadableCase(LABEL, typed, 'a whole number')]);
  }
  const count = countNeutrons(formula);
  const passed = value === count.neutrons;
  return finishValidation([
    {
      label: LABEL,
      passed,
      reason: passed
        ? `Right: ${formulaText(formula)} holds ${count.neutrons} neutrons.`
        : neutronSlip(value, count),
      actual: typed,
    },
  ]);
}

/**
 * Hints for a neutron count, from the rule to nearly the sum.
 * @param formula - The isotopic formula asked about.
 * @returns Three hints.
 */
export function neutronHints(formula: string): string[] {
  const count = countNeutrons(formula);
  const listed = count.rows
    .map(
      (row) =>
        `${isotopeText(row.massNumber, row.symbol)}: A = ${row.massNumber}, Z = ${row.atomicNumber}`,
    )
    .join('; ');
  const perAtom = count.rows
    .map(
      (row) =>
        `${row.massNumber} − ${row.atomicNumber} = ${row.neutronsPerAtom} in each ${isotopeText(row.massNumber, row.symbol)}${row.count === 1 ? '' : `, and there are ${row.count} of them`}`,
    )
    .join('; ');
  const chargeNote =
    count.parsed.charge === 0
      ? ''
      : ' The charge changes the electrons, not the nucleus.';
  return [
    `The [[mass number]] A counts the protons and the neutrons of a nucleus; the [[atomic number]] Z counts the protons alone.${chargeNote}`,
    `${listed}.`,
    `${perAtom}.`,
  ];
}

/**
 * The worked neutron count.
 * @param formula - The isotopic formula asked about.
 * @returns The sum, isotope by isotope.
 */
export function neutronSolution(formula: string): string {
  const count = countNeutrons(formula);
  const terms = count.rows
    .map(
      (row) =>
        `${isotopeText(row.massNumber, row.symbol)}: ${row.count} × (${row.massNumber} − ${row.atomicNumber}) = ${row.neutrons}`,
    )
    .join('; ');
  return `${terms}. In all: **${count.neutrons} neutrons**.`;
}

function neutronSlip(value: number, count: NeutronCount): string {
  let nucleons = 0;
  let protons = 0;
  for (const row of count.rows) {
    nucleons += row.count * row.massNumber;
    protons += row.count * row.atomicNumber;
  }
  if (value === nucleons) {
    return `${value} counts every nucleon, protons included. Take the protons away.`;
  }
  if (value === protons) return `${value} is the number of protons.`;
  if (count.rows.some((row) => row.count > 1)) {
    return `${value} is not it. Check that every atom is counted, as many times as the formula holds it.`;
  }
  return `${value} is not it. Subtract Z from A again.`;
}

function isotopeText(massNumber: number, symbol: string): string {
  return formulaText(`[${massNumber}${symbol}]`);
}
