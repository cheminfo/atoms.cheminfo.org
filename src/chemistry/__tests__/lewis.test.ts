import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { LEWIS_TARGETS } from '../../data/lewis.ts';
import {
  gradeLewis,
  readLewisAtoms,
  skeletonKey,
  valenceElectrons,
} from '../lewis.ts';

function idCode(smiles: string): string {
  return Molecule.fromSmiles(smiles).getIDCode();
}

const SULFURIC = { formula: 'H2SO4', accepted: ['O=S(=O)(O)O'] };

test('every listed structure grades as correct', () => {
  for (const target of LEWIS_TARGETS) {
    for (const smiles of target.accepted) {
      expect({
        formula: target.formula,
        verdict: gradeLewis(target, idCode(smiles)),
      }).toStrictEqual({
        formula: target.formula,
        verdict: { kind: 'correct', listed: true },
      });
    }
  }
});

test('the charge-separated drawing of an oxoacid is a Lewis structure too', () => {
  expect(gradeLewis(SULFURIC, idCode('O[S+2]([O-])([O-])O'))).toStrictEqual({
    kind: 'correct',
    listed: false,
  });
});

test('an empty drawing and a wrong formula are told apart', () => {
  expect(gradeLewis(SULFURIC, '')).toStrictEqual({ kind: 'empty' });
  expect(gradeLewis(SULFURIC, idCode('O=S(O)O'))).toStrictEqual({
    kind: 'wrong-formula',
    drawn: 'H2O3S',
    expected: 'H2SO4',
  });
});

test('hydrogens on the wrong atom are a wrong skeleton', () => {
  expect(gradeLewis(SULFURIC, idCode('OOS(=O)O'))).toStrictEqual({
    kind: 'wrong-connectivity',
  });
});

test('formal charges that do not add up to zero are reported', () => {
  expect(gradeLewis(SULFURIC, idCode('O=[S+](=O)(O)O'))).toMatchObject({
    kind: 'wrong-charge',
    netCharge: 1,
    expectedCharge: 0,
  });
});

test('a carbon left with six electrons is not a Lewis structure', () => {
  const formic = { formula: 'HCOOH', accepted: ['O=CO'] };
  const verdict = gradeLewis(formic, idCode('[O-][CH+]O'));
  expect(verdict.kind).toBe('invalid-atoms');
  expect(
    verdict.kind === 'invalid-atoms'
      ? verdict.atoms.map(({ symbol, electrons, status }) => ({
          symbol,
          electrons,
          status,
        }))
      : [],
  ).toStrictEqual([{ symbol: 'C', electrons: 6, status: 'short' }]);
});

test('the shell of every atom of nitric acid adds up', () => {
  const atoms = readLewisAtoms(Molecule.fromSmiles('O=[N+](O)[O-]'));
  expect(
    atoms.map(
      ({
        symbol,
        bonds,
        lonePairElectrons,
        formalCharge,
        electrons,
        status,
      }) => ({
        symbol,
        bonds,
        lonePairElectrons,
        formalCharge,
        electrons,
        status,
      }),
    ),
  ).toStrictEqual([
    {
      symbol: 'O',
      bonds: 2,
      lonePairElectrons: 4,
      formalCharge: 0,
      electrons: 8,
      status: 'full',
    },
    {
      symbol: 'N',
      bonds: 4,
      lonePairElectrons: 0,
      formalCharge: 1,
      electrons: 8,
      status: 'full',
    },
    {
      symbol: 'O',
      bonds: 2,
      lonePairElectrons: 4,
      formalCharge: 0,
      electrons: 8,
      status: 'full',
    },
    {
      symbol: 'O',
      bonds: 1,
      lonePairElectrons: 6,
      formalCharge: -1,
      electrons: 8,
      status: 'full',
    },
  ]);
});

test('sulfur in the expanded drawing of sulfuric acid holds twelve electrons', () => {
  const sulfur = readLewisAtoms(Molecule.fromSmiles('O=S(=O)(O)O')).find(
    (atom) => atom.symbol === 'S',
  );
  expect(sulfur).toMatchObject({
    bonds: 6,
    lonePairElectrons: 0,
    electrons: 12,
    status: 'expanded',
  });
});

test('boron is allowed its six', () => {
  const boron = readLewisAtoms(Molecule.fromSmiles('FB(F)F')).find(
    (atom) => atom.symbol === 'B',
  );
  expect(boron?.status).toBe('incomplete');
});

test('two drawings of one skeleton share a key; moving a hydrogen changes it', () => {
  const expanded = Molecule.fromSmiles('O=S(=O)(O)O');
  expect(skeletonKey(expanded)).toBe(
    skeletonKey(Molecule.fromSmiles('O[S+2]([O-])([O-])O')),
  );
  expect(skeletonKey(Molecule.fromSmiles('OP(O)O'))).not.toBe(
    skeletonKey(Molecule.fromSmiles('[H]P(=O)(O)O')),
  );
});

test('valence electrons follow the group of a main-group element', () => {
  expect(
    ['H', 'C', 'N', 'O', 'F', 'P', 'S', 'Cl', 'Br', 'I', 'Xe'].map((symbol) =>
      valenceElectrons(Molecule.fromSmiles(`[${symbol}]`).getAtomicNo(0)),
    ),
  ).toStrictEqual([1, 4, 5, 6, 7, 5, 6, 7, 7, 7, 8]);
  expect(valenceElectrons(26)).toBeNull();
});
