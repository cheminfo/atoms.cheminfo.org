import { Molecule } from 'openchemlib';
import { expect, test } from 'vitest';

import { LEWIS_TARGETS } from '../../data/lewis.ts';
import { LEWIS_TOOL, STRUCTURE_FIELD, describeSkeleton } from '../lewis.ts';

function drawn(smiles: string) {
  return { [STRUCTURE_FIELD]: Molecule.fromSmiles(smiles).getIDCode() };
}

const nitric = LEWIS_TARGETS.find((target) => target.formula === 'HNO3');
if (nitric === undefined) throw new Error('nitric acid is in the pool');

test('the reference drawing passes', () => {
  expect(LEWIS_TOOL.grade(nitric, drawn('O=[N+](O)[O-]')).cases).toStrictEqual([
    {
      label: 'Structure',
      passed: true,
      reason: 'Right: every atom has a full shell.',
      actual: Molecule.fromSmiles('O=[N+](O)[O-]').getIDCode(),
    },
  ]);
});

test('each kind of wrong drawing gets its own reason', () => {
  const reasons = [
    { [STRUCTURE_FIELD]: '' },
    drawn('O=NO'),
    // Peroxynitrous acid: the atoms of nitric acid, joined another way.
    drawn('OON=O'),
  ].map((answers) => LEWIS_TOOL.grade(nitric, answers).cases[0]?.reason);
  expect(reasons).toStrictEqual([
    'Draw the structure in the editor.',
    'The drawing is HNO₂; the question asks for HNO₃. Check the atoms and the hydrogens.',
    'All the atoms are there, but not bonded to the right neighbours. Where do the hydrogens sit?',
  ]);
});

test('the skeleton of every target can be put into words', () => {
  const described = Object.fromEntries(
    LEWIS_TARGETS.map((target) => [
      target.formula,
      describeSkeleton(Molecule.fromSmiles(target.accepted[0] ?? '')),
    ]),
  );
  expect(described.H2SO4).toBe('S is bonded to 4 O; one H on each of 2 O');
  expect(described.H2C2O4).toBe(
    'each of 2 C is bonded to one C and 2 O; one H on each of 2 O',
  );
  expect(described.H3PO3).toBe(
    'P is bonded to 3 O; one H on each of 2 O; one H on the P',
  );
  expect(described.HCN).toBe('C is bonded to N; one H on the C');
});

test('the solution names the formal charges of the reference drawing', () => {
  expect(LEWIS_TOOL.solution(nitric)).toBe(
    'The drawing below: N is bonded to 3 O; one H on the O. Formal charges: N +1, O −1.',
  );
});
