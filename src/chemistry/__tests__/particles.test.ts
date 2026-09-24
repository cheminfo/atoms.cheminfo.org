import { expect, test } from 'vitest';

import { ELECTRON_FORMULAS } from '../../data/electrons.ts';
import { NEUTRON_FORMULAS } from '../../data/neutrons.ts';
import { countElectrons, countNeutrons } from '../particles.ts';

// Counted by hand: Z of every atom, minus the charge.
const ELECTRONS: Record<string, number> = {
  'Fe(3+)': 23,
  H2O: 10,
  NH3: 10,
  'O(2-)': 10,
  'O2(1-)': 17,
  LiF: 12,
  BF3: 32,
  NaCl: 28,
  MgO: 20,
  'Ta(5+)': 68,
  'NO3(1-)': 32,
  NO: 15,
  Cl2O: 42,
  'NO2(1-)': 24,
  'Zn(OH)2': 48,
  'OH(1-)': 10,
  Br2O7: 126,
  AgNO3: 78,
  KBr: 54,
  SF6: 70,
  S8: 128,
  H2O2: 18,
  H3PO4: 50,
  'S2O3(2-)': 58,
  'NH4(1+)': 10,
};

// Counted by hand: A − Z of every atom.
const NEUTRONS: Record<string, number> = {
  '[56Fe](3+)': 30,
  '[12C]': 6,
  '[1H]2': 0,
  '[88Sr]': 50,
  '[238U][19F]6': 206,
  '[13C]': 7,
  '[2H]': 1,
  '[35Cl][35Cl]': 36,
  '[79Br][81Br]': 90,
};

test('every electron question is counted, charge included', () => {
  const counted: Record<string, number> = {};
  for (const formula of ELECTRON_FORMULAS) {
    counted[formula] = countElectrons(formula).electrons;
  }
  expect(counted).toStrictEqual(ELECTRONS);
});

test('the electron count shows its arithmetic', () => {
  const nitrate = countElectrons('NO3(1-)');
  expect(nitrate.rows).toStrictEqual([
    { symbol: 'N', atomicNumber: 7, count: 1, protons: 7 },
    { symbol: 'O', atomicNumber: 8, count: 3, protons: 24 },
  ]);
  expect(nitrate.protons).toBe(31);
  expect(nitrate.charge).toBe(-1);
});

test('every neutron question is counted, isotope by isotope', () => {
  const counted: Record<string, number> = {};
  for (const formula of NEUTRON_FORMULAS) {
    counted[formula] = countNeutrons(formula).neutrons;
  }
  expect(counted).toStrictEqual(NEUTRONS);
});

test('an atom without a mass number cannot be counted, and the message says how to write it', () => {
  expect(() => countNeutrons('UF6')).toThrow(
    'U carries no mass number: write it [238U] to say which isotope it is.',
  );
});
