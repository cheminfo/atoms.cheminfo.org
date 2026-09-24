import { expect, test } from 'vitest';

import {
  TWO_ISOTOPE_ELEMENTS,
  commonMassNumber,
  lighterAbundance,
  twoIsotopeElement,
} from '../isotopes.ts';

test('the elements with exactly two stable isotopes', () => {
  expect(TWO_ISOTOPE_ELEMENTS.map((element) => element.symbol)).toStrictEqual([
    'H',
    'He',
    'Li',
    'B',
    'C',
    'N',
    'Cl',
    'V',
    'Cu',
    'Ga',
    'Br',
    'Rb',
    'Ag',
    'In',
    'Sb',
    'La',
    'Eu',
    'Lu',
    'Ta',
    'Re',
    'Ir',
    'Tl',
  ]);
});

test('the atomic mass gives back the abundances', () => {
  const chlorine = twoIsotopeElement('Cl');
  expect(chlorine?.isotopes.map((isotope) => isotope.massNumber)).toStrictEqual(
    [35, 37],
  );
  const [light, heavy] = chlorine?.isotopes ?? [];
  expect(
    lighterAbundance(
      chlorine?.atomicMass ?? 0,
      light?.mass ?? 0,
      heavy?.mass ?? 0,
    ),
  ).toBeCloseTo(75.76, 6);
});

test('an element without two isotopes is not in the pool', () => {
  expect(twoIsotopeElement('F')).toBeUndefined();
});

test('the most abundant isotope names the example of a mass number', () => {
  expect(commonMassNumber('C')).toBe(12);
  expect(commonMassNumber('Fe')).toBe(56);
  expect(commonMassNumber('Cl')).toBe(35);
});
