import { expect, test } from 'vitest';

import { OXIDATION_COMPOUNDS } from '../../data/oxidation.ts';
import { OXIDATION_TOOL } from '../oxidation.ts';

function compound(formula: string) {
  const found = OXIDATION_COMPOUNDS.find((entry) => entry.formula === formula);
  if (found === undefined) throw new Error(`${formula} is not in the pool`);
  return found;
}

test('one box per element, in the order the data lists them', () => {
  expect(
    OXIDATION_TOOL.fields(compound('KMnO4')).map((field) => field.key),
  ).toStrictEqual(['K', 'Mn', 'O']);
});

test('a right answer passes, a wrong one is measured against the charge', () => {
  const nitrate = compound('NO3-');
  expect(OXIDATION_TOOL.grade(nitrate, { N: '+5', O: '−2' }).passed).toBe(true);
  expect(
    OXIDATION_TOOL.grade(nitrate, { N: '+4', O: '-2' }).cases,
  ).toStrictEqual([
    {
      label: 'N',
      passed: false,
      reason: 'Not +4: your states add up to −2, but the charge of NO₃⁻ is −1.',
      actual: '+4',
    },
    { label: 'O', passed: true, reason: '−2 is right.', actual: '-2' },
  ]);
});

test('the last hint leaves one element to the sum rule', () => {
  expect(OXIDATION_TOOL.hints(compound('K2Cr2O7'))).toStrictEqual([
    'Each [[oxidation state]] times its number of atoms, added up over the formula, gives the charge: 0 for K₂Cr₂O₇.',
    'Start from the values that rarely change: K +1, O −2. Watch the exceptions: a peroxide, a metal hydride.',
    '2 × (+1) + 7 × (−2) + 2 × Cr = 0, so 2 × Cr = +12.',
  ]);
  expect(OXIDATION_TOOL.hints(compound('H2O2'))[2]).toBe(
    '2 × (+1) + 2 × O = 0, so 2 × O = −2.',
  );
  expect(OXIDATION_TOOL.hints(compound('NaSCN'))[2]).toBe(
    'S is −2, C is +4; the sum rule then decides N.',
  );
});

test('an element on its own is at zero', () => {
  expect(OXIDATION_TOOL.hints(compound('N2'))[2]).toBe(
    'An element on its own, whatever its form, is at 0.',
  );
});

test('the solution lists every state, then checks the sum', () => {
  expect(OXIDATION_TOOL.solution(compound('KH'))).toBe(
    '**K +1**, **H −1**. Check: 1 × (+1) + 1 × (−1) = 0, the charge of KH.',
  );
});

test('every compound of the pool has three hints and a solution', () => {
  for (const entry of OXIDATION_COMPOUNDS) {
    expect(OXIDATION_TOOL.hints(entry)).toHaveLength(3);
    expect(OXIDATION_TOOL.solution(entry)).toContain('Check:');
  }
});
