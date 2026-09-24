import { expect, test } from 'vitest';

import { OXIDATION_COMPOUNDS } from '../../data/oxidation.ts';
import { elementsToDeduce, sumRule, usualStatesHolding } from '../oxidation.ts';

test('every compound of the pool passes the sum rule', () => {
  const failing = OXIDATION_COMPOUNDS.filter(
    (compound) => !sumRule(compound.formula, compound.oxidation).holds,
  ).map((compound) => compound.formula);
  expect(failing).toStrictEqual([]);
  expect(OXIDATION_COMPOUNDS).toHaveLength(60);
});

test('every compound names the state of each of its elements, and only those', () => {
  for (const compound of OXIDATION_COMPOUNDS) {
    const symbols = sumRule(compound.formula, {}).terms.map(
      (term) => term.symbol,
    );
    expect({
      formula: compound.formula,
      symbols: symbols.toSorted(),
    }).toStrictEqual({
      formula: compound.formula,
      symbols: Object.keys(compound.oxidation).toSorted(),
    });
  }
});

test('the sum rule is written out term by term', () => {
  expect(sumRule('NO3-', { N: 5, O: -2 })).toStrictEqual({
    terms: [
      { symbol: 'N', count: 1, state: 5 },
      { symbol: 'O', count: 3, state: -2 },
    ],
    sum: -1,
    charge: -1,
    holds: true,
  });
  expect(sumRule('NO3-', { N: 4 }).holds).toBe(false);
});

test('what the rule is left to decide', () => {
  expect(elementsToDeduce({ H: 1, N: 5, O: -2 })).toStrictEqual(['N']);
  expect(elementsToDeduce({ H: 1, O: -1 })).toStrictEqual(['O']);
  expect(elementsToDeduce({ K: 1, H: -1 })).toStrictEqual(['H']);
  expect(elementsToDeduce({ N: 0 })).toStrictEqual(['N']);
  expect(usualStatesHolding({ K: 1, Mn: 7, O: -2 })).toStrictEqual([
    { symbol: 'K', state: 1 },
    { symbol: 'O', state: -2 },
  ]);
});
