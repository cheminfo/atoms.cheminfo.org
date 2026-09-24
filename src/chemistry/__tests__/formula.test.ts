import { expect, test } from 'vitest';

import {
  FormulaError,
  atomCounts,
  canonicalFormula,
  formulaText,
  normalizeFormula,
  readFormula,
} from '../formula.ts';

test('a trailing charge is rewritten into the syntax the parser reads', () => {
  expect(normalizeFormula('NO3-')).toBe('NO3(-1)');
  expect(normalizeFormula('SO4--')).toBe('SO4(-2)');
  expect(normalizeFormula('S2O3-2')).toBe('S2O3(-2)');
  expect(normalizeFormula('CO3 2-')).toBe('CO3(-2)');
  expect(normalizeFormula('CO3^2-')).toBe('CO3(-2)');
  expect(normalizeFormula('NH4+')).toBe('NH4(+1)');
  expect(normalizeFormula('Fe+3')).toBe('Fe(+3)');
});

test('a charge already in parentheses is left as it is', () => {
  expect(normalizeFormula('NO3(1-)')).toBe('NO3(1-)');
  expect(normalizeFormula(' Fe(3+) ')).toBe('Fe(3+)');
});

test('a hydrate dot becomes a part separator, never a decimal', () => {
  expect(normalizeFormula('CuSO4.5H2O')).toBe('CuSO4 . 5H2O');
  expect(normalizeFormula('CuSO4·5H2O')).toBe('CuSO4 . 5H2O');
  expect(normalizeFormula('CuSO4*5H2O')).toBe('CuSO4 . 5H2O');
});

test('a formula is read into atoms and charge', () => {
  const nitrate = readFormula('NO3-');
  expect(nitrate.charge).toBe(-1);
  expect([...atomCounts(nitrate)]).toStrictEqual([
    ['N', 1],
    ['O', 3],
  ]);

  const hydrate = readFormula('CuSO4.5H2O');
  expect(hydrate.parts).toHaveLength(2);
  expect(Object.fromEntries(atomCounts(hydrate))).toStrictEqual({
    Cu: 1,
    S: 1,
    O: 9,
    H: 10,
  });
});

test('an isotope keeps its mass number, atoms in the order written', () => {
  expect(readFormula('[238U][19F]6').parts[0]?.atoms).toStrictEqual([
    { symbol: 'U', massNumber: 238, count: 1 },
    { symbol: 'F', massNumber: 19, count: 6 },
  ]);
});

test('what is not a formula says why, for a student', () => {
  expect(() => readFormula('')).toThrow(FormulaError);
  expect(() => readFormula('')).toThrow('Type a formula first.');
  expect(() => readFormula('Hx')).toThrow('“Hx” is not an element symbol.');
});

test('two spellings of one compound share a canonical formula', () => {
  expect(canonicalFormula('NaOH')).toBe(canonicalFormula('HONa'));
  expect(canonicalFormula('NaOH')).toBe(canonicalFormula('NaHO'));
  expect(canonicalFormula('H2O')).not.toBe(canonicalFormula('D2O'));
});

test('a formula in prose is written the way a chemist writes it', () => {
  expect(formulaText('NO3-')).toBe('NO₃⁻');
  expect(formulaText('Fe(3+)')).toBe('Fe³⁺');
  expect(formulaText('S2O3(2-)')).toBe('S₂O₃²⁻');
  expect(formulaText('[238U][19F]6')).toBe('²³⁸U¹⁹F₆');
  expect(formulaText('H2O')).toBe('H₂O');
});
