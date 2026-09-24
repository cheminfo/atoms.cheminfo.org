import { expect, test } from 'vitest';

import { twoIsotopeElement } from '../../chemistry/isotopes.ts';
import { ISOTOPES_TOOL, expectedAbundances } from '../isotopes.ts';

const chlorine = twoIsotopeElement('Cl');
if (chlorine === undefined) throw new Error('chlorine has two stable isotopes');

test('one box per isotope, lighter first', () => {
  expect(ISOTOPES_TOOL.fields(chlorine)).toStrictEqual([
    { key: 'lighter', label: '³⁵Cl (%)', placeholder: 'abundance in %' },
    { key: 'heavier', label: '³⁷Cl (%)', placeholder: 'abundance in %' },
  ]);
});

test('an answer within a point of the masses passes', () => {
  const { lighter, heavier } = expectedAbundances(chlorine);
  expect(lighter).toBeCloseTo(75.76, 6);
  expect(heavier).toBeCloseTo(24.24, 6);
  expect(
    ISOTOPES_TOOL.grade(chlorine, { lighter: '75.8', heavier: '24,2 %' })
      .passed,
  ).toBe(true);
  expect(
    ISOTOPES_TOOL.grade(chlorine, { lighter: '77', heavier: '23' }).passed,
  ).toBe(false);
});

test('swapped abundances and fractions are named', () => {
  expect(
    ISOTOPES_TOOL.grade(chlorine, {
      lighter: '24.24',
      heavier: '0.7576',
    }).cases.map((verdict) => verdict.reason),
  ).toStrictEqual([
    'That is the other isotope’s abundance: the two are swapped.',
    '0.7576 looks like a fraction; the box asks for a percentage.',
  ]);
});

test('the solution solves the one equation', () => {
  expect(ISOTOPES_TOOL.solution(chlorine)).toBe(
    'x = (36.9659 − 35.4529) / (36.9659 − 34.9689) = 0.7576, so **³⁵Cl: 75.76 %** and **³⁷Cl: 24.24 %**.',
  );
});
