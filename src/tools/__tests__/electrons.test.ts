import { expect, test } from 'vitest';

import { ELECTRONS_TOOL } from '../electrons.ts';

test('a right count passes, and says so', () => {
  const check = ELECTRONS_TOOL.grade('NO3(1-)', { electrons: '32' });
  expect(check.passed).toBe(true);
  expect(check.cases).toStrictEqual([
    {
      label: 'Electrons',
      passed: true,
      reason: 'Right: NO₃⁻ holds 32 electrons.',
      actual: '32',
    },
  ]);
});

test('the usual slips are named', () => {
  const reasons = ['31', '30', '40', '', 'lots'].map(
    (typed) =>
      ELECTRONS_TOOL.grade('NO3(1-)', { electrons: typed }).cases[0]?.reason,
  );
  expect(reasons).toStrictEqual([
    '31 is the number of protons. A charge of 1− changes the electrons.',
    'The charge is counted the wrong way round: a cation has lost electrons, an anion has gained them.',
    '40 is not it. Add the atomic numbers again, one atom at a time.',
    'Type a number of electrons.',
    '“lots” is not a whole number.',
  ]);
});

test('the hints run from the rule to nearly the sum', () => {
  expect(ELECTRONS_TOOL.hints('Fe(3+)')).toStrictEqual([
    'A neutral atom has as many electrons as protons: its [[atomic number]] Z. Start from the atoms, then look at the [[charge]].',
    'In Fe³⁺, Fe has Z = 26.',
    'The atom brings 26 protons. A charge of 3+ means 3 electrons fewer than protons.',
  ]);
  expect(ELECTRONS_TOOL.hints('H2O')[2]).toBe(
    'The atoms bring 2 × 1 + 8 = 10 protons. The formula is neutral: as many electrons as protons.',
  );
});

test('the solution adds up atom by atom, then applies the charge', () => {
  expect(ELECTRONS_TOOL.solution('NO3(1-)')).toBe(
    'N: 1 × 7 = 7; O: 3 × 8 = 24. Protons: 31; charge 1−, so 31 + 1 = **32 electrons**.',
  );
  expect(ELECTRONS_TOOL.solution('H2O')).toBe(
    'H: 2 × 1 = 2; O: 1 × 8 = 8. Protons: 10; neutral, so **10 electrons**.',
  );
});
