import { expect, test } from 'vitest';

import { NEUTRONS_TOOL } from '../neutrons.ts';

test('a right count passes', () => {
  expect(NEUTRONS_TOOL.grade('[238U][19F]6', { neutrons: '206' }).passed).toBe(
    true,
  );
});

test('counting the nucleons, or the protons, is named', () => {
  const reasons = ['352', '146', '200'].map(
    (typed) =>
      NEUTRONS_TOOL.grade('[238U][19F]6', { neutrons: typed }).cases[0]?.reason,
  );
  expect(reasons).toStrictEqual([
    '352 counts every nucleon, protons included. Take the protons away.',
    '146 is the number of protons.',
    '200 is not it. Check that every atom is counted, as many times as the formula holds it.',
  ]);
});

test('the charge of an ion is set aside in the first hint', () => {
  expect(NEUTRONS_TOOL.hints('[56Fe](3+)')).toStrictEqual([
    'The [[mass number]] A counts the protons and the neutrons of a nucleus; the [[atomic number]] Z counts the protons alone. The charge changes the electrons, not the nucleus.',
    '⁵⁶Fe: A = 56, Z = 26.',
    '56 − 26 = 30 in each ⁵⁶Fe.',
  ]);
});

test('the solution sums isotope by isotope', () => {
  expect(NEUTRONS_TOOL.solution('[238U][19F]6')).toBe(
    '²³⁸U: 1 × (238 − 92) = 146; ¹⁹F: 6 × (19 − 9) = 60. In all: **206 neutrons**.',
  );
});
