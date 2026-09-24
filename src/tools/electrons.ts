import { finishValidation } from 'react-cheminfo/core';

import { formulaText } from '../chemistry/formula.ts';
import type { ElectronCount } from '../chemistry/particles.ts';
import { countElectrons } from '../chemistry/particles.ts';
import { ELECTRON_FORMULAS } from '../data/electrons.ts';
import { parseInteger } from '../exercises/answers.ts';
import { emptyCase, unreadableCase } from '../exercises/cases.ts';
import type { AnswerCheck, Answers, SeriesTool } from '../exercises/types.ts';

const FIELD = 'electrons';
const LABEL = 'Electrons';

/** Count the electrons of a molecule or an ion. */
export const ELECTRONS_TOOL: SeriesTool<string> = {
  id: 'electrons',
  pool: ELECTRON_FORMULAS,
  key: (formula) => formula,
  fields: () => [{ key: FIELD, label: LABEL, placeholder: 'e.g. 10' }],
  grade: gradeElectrons,
  hints: electronHints,
  solution: electronSolution,
};

/**
 * Grade an electron count.
 * @param formula - The formula asked about.
 * @param answers - What the student typed.
 * @returns One case, whose reason names the usual slip when it recognises one.
 */
export function gradeElectrons(formula: string, answers: Answers): AnswerCheck {
  const typed = answers[FIELD] ?? '';
  if (typed.trim() === '') {
    return finishValidation([emptyCase(LABEL, 'a number of electrons')]);
  }
  const value = parseInteger(typed);
  if (value === null) {
    return finishValidation([unreadableCase(LABEL, typed, 'a whole number')]);
  }
  const count = countElectrons(formula);
  const passed = value === count.electrons;
  return finishValidation([
    {
      label: LABEL,
      passed,
      reason: passed
        ? `Right: ${formulaText(formula)} holds ${count.electrons} electrons.`
        : electronSlip(value, count),
      actual: typed,
    },
  ]);
}

/**
 * Hints for an electron count, from the rule to nearly the sum.
 * @param formula - The formula asked about.
 * @returns Three hints.
 */
export function electronHints(formula: string): string[] {
  const count = countElectrons(formula);
  const written = formulaText(formula);
  const zList = count.rows
    .map((row) => `${row.symbol} has Z = ${row.atomicNumber}`)
    .join(', ');
  const sum = count.rows
    .map((row) =>
      row.count === 1
        ? String(row.atomicNumber)
        : `${row.count} × ${row.atomicNumber}`,
    )
    .join(' + ');
  const single = count.rows.length === 1 && count.rows[0]?.count === 1;
  const protons = single
    ? `The atom brings ${count.protons} protons.`
    : `The atoms bring ${sum} = ${count.protons} protons.`;
  return [
    'A neutral atom has as many electrons as protons: its [[atomic number]] Z. Start from the atoms, then look at the [[charge]].',
    `In ${written}, ${zList}.`,
    `${protons} ${chargeSentence(count.charge)}`,
  ];
}

/**
 * The worked electron count.
 * @param formula - The formula asked about.
 * @returns The sum, atom by atom, then the charge.
 */
export function electronSolution(formula: string): string {
  const count = countElectrons(formula);
  const terms = count.rows
    .map(
      (row) =>
        `${row.symbol}: ${row.count} × ${row.atomicNumber} = ${row.protons}`,
    )
    .join('; ');
  const tail =
    count.charge === 0
      ? `neutral, so **${count.electrons} electrons**`
      : `charge ${chargeText(count.charge)}, so ${count.protons} ${count.charge > 0 ? '−' : '+'} ${Math.abs(count.charge)} = **${count.electrons} electrons**`;
  return `${terms}. Protons: ${count.protons}; ${tail}.`;
}

function electronSlip(value: number, count: ElectronCount): string {
  if (count.charge !== 0 && value === count.protons) {
    return `${value} is the number of protons. A charge of ${chargeText(count.charge)} changes the electrons.`;
  }
  if (count.charge !== 0 && value === count.protons + count.charge) {
    return 'The charge is counted the wrong way round: a cation has lost electrons, an anion has gained them.';
  }
  return `${value} is not it. Add the atomic numbers again, one atom at a time.`;
}

function chargeSentence(charge: number): string {
  if (charge === 0) {
    return 'The formula is neutral: as many electrons as protons.';
  }
  const electrons = Math.abs(charge);
  const noun = electrons === 1 ? 'electron' : 'electrons';
  return charge > 0
    ? `A charge of ${chargeText(charge)} means ${electrons} ${noun} fewer than protons.`
    : `A charge of ${chargeText(charge)} means ${electrons} ${noun} more than protons.`;
}

function chargeText(charge: number): string {
  return `${Math.abs(charge)}${charge > 0 ? '+' : '−'}`;
}
