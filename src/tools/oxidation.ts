import { finishValidation } from 'react-cheminfo/core';

import { formulaText } from '../chemistry/formula.ts';
import type { SumTerm } from '../chemistry/oxidation.ts';
import {
  elementsToDeduce,
  sumRule,
  usualStatesHolding,
} from '../chemistry/oxidation.ts';
import type { OxidationCompound } from '../data/oxidation.ts';
import { OXIDATION_COMPOUNDS } from '../data/oxidation.ts';
import { formatSigned, parseInteger } from '../exercises/answers.ts';
import { emptyCase, unreadableCase } from '../exercises/cases.ts';
import type {
  AnswerCheck,
  AnswerField,
  Answers,
  FieldCase,
  SeriesTool,
} from '../exercises/types.ts';

/** Give every element of a compound its oxidation state. */
export const OXIDATION_TOOL: SeriesTool<OxidationCompound> = {
  id: 'oxidation',
  pool: OXIDATION_COMPOUNDS,
  key: (compound) => compound.formula,
  level: (compound) => compound.level,
  fields: oxidationFields,
  grade: gradeOxidation,
  hints: oxidationHints,
  solution: oxidationSolution,
};

/**
 * One box per element of the compound.
 * @param compound - The compound asked about.
 * @returns The boxes, keyed by element symbol.
 */
export function oxidationFields(compound: OxidationCompound): AnswerField[] {
  return Object.keys(compound.oxidation).map((symbol) => ({
    key: symbol,
    label: symbol,
    placeholder: 'e.g. +2',
  }));
}

/**
 * Grade the oxidation states, one case per element. When every box is filled
 * and the answer breaks the sum rule, a wrong element's reason says by how much.
 * @param compound - The compound asked about.
 * @param answers - What the student typed, keyed by element symbol.
 * @returns One case per element.
 */
export function gradeOxidation(
  compound: OxidationCompound,
  answers: Answers,
): AnswerCheck {
  const typedStates: Record<string, number | null> = {};
  for (const symbol of Object.keys(compound.oxidation)) {
    typedStates[symbol] = parseInteger(answers[symbol] ?? '');
  }
  const rule = sumRule(compound.formula, typedStates);
  const complete = rule.terms.every((term) => term.state !== null);

  const cases: FieldCase[] = [];
  for (const [symbol, expected] of Object.entries(compound.oxidation)) {
    const typed = answers[symbol] ?? '';
    if (typed.trim() === '') {
      cases.push(emptyCase(symbol, `the oxidation state of ${symbol}`));
      continue;
    }
    const value = typedStates[symbol] ?? null;
    if (value === null) {
      cases.push(unreadableCase(symbol, typed, 'a whole number'));
      continue;
    }
    const passed = value === expected;
    let reason = `${formatSigned(expected)} is right.`;
    if (!passed) {
      reason =
        complete && !rule.holds
          ? `Not ${formatSigned(value)}: your states add up to ${formatSigned(rule.sum)}, but the charge of ${formulaText(compound.formula)} is ${formatSigned(rule.charge)}.`
          : `Not ${formatSigned(value)} in ${formulaText(compound.formula)}.`;
    }
    cases.push({ label: symbol, passed, reason, actual: typed });
  }
  return finishValidation(cases);
}

/**
 * Hints for an oxidation-state question: the sum rule, the usual values, then
 * the equation that leaves the element to deduce.
 * @param compound - The compound asked about.
 * @returns Three hints.
 */
export function oxidationHints(compound: OxidationCompound): string[] {
  const written = formulaText(compound.formula);
  const rule = sumRule(compound.formula, compound.oxidation);
  const symbols = Object.keys(compound.oxidation);
  if (symbols.length === 1) {
    return [
      'The [[oxidation state]] of an atom is the charge it would carry if every bond were ionic.',
      `${written} holds a single element: no atom pulls electrons from an atom of another kind.`,
      'An element on its own, whatever its form, is at 0.',
    ];
  }

  const holding = usualStatesHolding(compound.oxidation);
  const usual =
    holding.length === 0
      ? 'None of its elements takes a value that rarely changes, so start from the most electronegative one.'
      : `Start from the values that rarely change: ${holding.map(({ symbol, state }) => `${symbol} ${formatSigned(state)}`).join(', ')}. Watch the exceptions: a peroxide, a metal hydride.`;
  return [
    `Each [[oxidation state]] times its number of atoms, added up over the formula, gives the charge: ${formatSigned(rule.charge)} for ${written}.`,
    usual,
    deductionHint(compound),
  ];
}

/**
 * The worked answer: every state, then the sum rule checked.
 * @param compound - The compound asked about.
 * @returns The states and the check.
 */
export function oxidationSolution(compound: OxidationCompound): string {
  const rule = sumRule(compound.formula, compound.oxidation);
  const terms = inFieldOrder(compound, rule.terms);
  const states = terms
    .map((term) => `**${term.symbol} ${formatSigned(term.state ?? 0)}**`)
    .join(', ');
  const check = terms
    .map((term) => `${term.count} × (${formatSigned(term.state ?? 0)})`)
    .join(' + ');
  return `${states}. Check: ${check} = ${formatSigned(rule.sum)}, the charge of ${formulaText(compound.formula)}.`;
}

function deductionHint(compound: OxidationCompound): string {
  const deduced = elementsToDeduce(compound.oxidation);
  const last = deduced.at(-1);
  if (last === undefined) {
    return 'Every element takes its usual value here: check that they add up to the charge.';
  }
  if (deduced.length > 1) {
    const given = deduced
      .slice(0, -1)
      .map(
        (symbol) =>
          `${symbol} is ${formatSigned(compound.oxidation[symbol] ?? 0)}`,
      )
      .join(', ');
    return `${given}; the sum rule then decides ${last}.`;
  }
  const rule = sumRule(compound.formula, compound.oxidation);
  const term = rule.terms.find((candidate) => candidate.symbol === last);
  const count = term?.count ?? 1;
  const others = inFieldOrder(compound, rule.terms).filter(
    (candidate) => candidate.symbol !== last,
  );
  let known = 0;
  for (const other of others) known += other.count * (other.state ?? 0);
  const left = others
    .map((other) => `${other.count} × (${formatSigned(other.state ?? 0)})`)
    .join(' + ');
  const unknown = count === 1 ? last : `${count} × ${last}`;
  return `${left} + ${unknown} = ${formatSigned(rule.charge)}, so ${unknown} = ${formatSigned(rule.charge - known)}.`;
}

function inFieldOrder(
  compound: OxidationCompound,
  terms: readonly SumTerm[],
): SumTerm[] {
  const bySymbol = new Map<string, SumTerm>();
  for (const term of terms) bySymbol.set(term.symbol, term);
  const ordered: SumTerm[] = [];
  for (const symbol of Object.keys(compound.oxidation)) {
    const term = bySymbol.get(symbol);
    if (term !== undefined) ordered.push(term);
  }
  return ordered;
}
