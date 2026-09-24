import { atomCounts, readFormula } from './formula.ts';

/** One element of a formula in the sum rule: how many atoms, at which state. */
export interface SumTerm {
  symbol: string;
  count: number;
  /** The oxidation state given to the element, or null when none is given yet. */
  state: number | null;
}

/** The sum rule, written out for one formula. */
export interface SumRule {
  terms: SumTerm[];
  /** `Σ count × state`, over the terms that have a state. */
  sum: number;
  /** The charge of the formula, which the sum must equal. */
  charge: number;
  /** Whether every term has a state and the sum equals the charge. */
  holds: boolean;
}

/**
 * The oxidation state an element takes in nearly every compound of a first
 * course, and why. An element absent from here has no such default: its state
 * is what the sum rule leaves for it.
 */
export const USUAL_STATES: Readonly<Record<string, number>> = {
  H: 1,
  O: -2,
  F: -1,
  Li: 1,
  Na: 1,
  K: 1,
  Rb: 1,
  Cs: 1,
  Be: 2,
  Mg: 2,
  Ca: 2,
  Sr: 2,
  Ba: 2,
  Al: 3,
};

/**
 * Write out the sum rule of a formula: every element's oxidation state times
 * its number of atoms adds up to the charge.
 * @param formula - The formula, charge included.
 * @param states - The oxidation state given to each element; a missing one is
 * left out of the sum.
 * @returns The terms, their sum and the charge.
 */
export function sumRule(
  formula: string,
  states: Readonly<Record<string, number | null | undefined>>,
): SumRule {
  const parsed = readFormula(formula);
  const terms: SumTerm[] = [];
  let sum = 0;
  let complete = true;
  for (const [symbol, count] of atomCounts(parsed)) {
    const state = states[symbol] ?? null;
    if (state === null) complete = false;
    else sum += count * state;
    terms.push({ symbol, count, state });
  }
  return {
    terms,
    sum,
    charge: parsed.charge,
    holds: complete && sum === parsed.charge,
  };
}

/**
 * The elements of a compound whose oxidation state is not the usual one, or
 * that have none: what the sum rule is left to decide.
 * @param oxidation - The oxidation state of every element of the compound.
 * @returns Their symbols, in the order the record lists them.
 */
export function elementsToDeduce(
  oxidation: Readonly<Record<string, number>>,
): string[] {
  const symbols = Object.keys(oxidation);
  // An element on its own is at zero whatever its usual state elsewhere.
  if (symbols.length === 1) return symbols;
  const deduced: string[] = [];
  for (const symbol of symbols) {
    if (USUAL_STATES[symbol] !== oxidation[symbol]) deduced.push(symbol);
  }
  return deduced;
}

/**
 * The usual oxidation states that hold in a compound, for a hint to start from.
 * @param oxidation - The oxidation state of every element of the compound.
 * @returns Symbol and state of each element that takes its usual value here.
 */
export function usualStatesHolding(
  oxidation: Readonly<Record<string, number>>,
): Array<{ symbol: string; state: number }> {
  const holding: Array<{ symbol: string; state: number }> = [];
  if (Object.keys(oxidation).length === 1) return holding;
  for (const [symbol, state] of Object.entries(oxidation)) {
    if (USUAL_STATES[symbol] === state) holding.push({ symbol, state });
  }
  return holding;
}
