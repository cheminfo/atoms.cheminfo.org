import { Molecule } from 'openchemlib';
import { finishValidation } from 'react-cheminfo/core';

import { formulaText } from '../chemistry/formula.ts';
import type { LewisTarget, LewisVerdict } from '../chemistry/lewis.ts';
import { gradeLewis, readLewisAtoms } from '../chemistry/lewis.ts';
import { LEWIS_TARGETS } from '../data/lewis.ts';
import { formatSigned } from '../exercises/answers.ts';
import type { AnswerCheck, Answers, SeriesTool } from '../exercises/types.ts';

/** Key of the drawn structure, as an OpenChemLib ID code, in the answers. */
export const STRUCTURE_FIELD = 'structure';

const LABEL = 'Structure';

/** Draw the Lewis structure of a formula. */
export const LEWIS_TOOL: SeriesTool<LewisTarget> = {
  id: 'lewis',
  pool: LEWIS_TARGETS,
  key: (target) => target.formula,
  // The answer is drawn in the structure editor, not typed into a box.
  fields: () => [],
  grade: gradeLewisAnswer,
  hints: lewisHints,
  solution: lewisSolution,
};

/**
 * Grade a drawing.
 * @param target - The formula asked about, with its accepted structures.
 * @param answers - The drawing, as an ID code under {@link STRUCTURE_FIELD}.
 * @returns One case whose reason says what is wrong with the drawing.
 */
export function gradeLewisAnswer(
  target: LewisTarget,
  answers: Answers,
): AnswerCheck {
  const idCode = answers[STRUCTURE_FIELD] ?? '';
  const verdict = gradeLewis(target, idCode);
  return finishValidation([
    {
      label: LABEL,
      passed: verdict.kind === 'correct',
      reason: verdictReason(target, verdict),
      actual: idCode === '' ? null : idCode,
    },
  ]);
}

/**
 * Hints for a Lewis structure, from the electron count to the skeleton.
 * @param target - The formula asked about.
 * @returns Three hints.
 */
export function lewisHints(target: LewisTarget): string[] {
  const [reference] = target.accepted;
  const molecule = Molecule.fromSmiles(reference ?? '');
  return [
    `Count the [[valence electrons]] of ${formulaText(target.formula)} first: the drawing has to place every one of them, in bonds or in [[lone pair|lone pairs]].`,
    'The atom that forms the most bonds sits in the centre. In an oxoacid every hydrogen is on an oxygen, and every oxygen on the central atom.',
    `Connect ${describeSkeleton(molecule)}. Then give each atom a full shell with double bonds or [[formal charge|formal charges]].`,
  ];
}

/**
 * The worked Lewis structure, in words; the page draws the structure itself.
 * @param target - The formula asked about.
 * @returns How the reference drawing places the electrons.
 */
export function lewisSolution(target: LewisTarget): string {
  const [reference] = target.accepted;
  const molecule = Molecule.fromSmiles(reference ?? '');
  const charged = readLewisAtoms(molecule).filter(
    (atom) => atom.formalCharge !== 0,
  );
  const charges =
    charged.length === 0
      ? 'No atom carries a formal charge.'
      : `Formal charges: ${charged.map((atom) => `${atom.symbol} ${atom.formalCharge > 0 ? '+' : '−'}${Math.abs(atom.formalCharge)}`).join(', ')}.`;
  return `The drawing below: ${describeSkeleton(molecule)}. ${charges}`;
}

/**
 * Say which atoms are bonded to which, the way a hint gives the skeleton away.
 * @param molecule - A structure.
 * @returns E.g. `S is bonded to 4 O; one H on each of 2 O`.
 */
export function describeSkeleton(molecule: Molecule): string {
  const copy = molecule.getCompactCopy();
  copy.ensureHelperArrays(Molecule.cHelperNeighbours);
  const centres = new Map<string, number>();
  const carriers = new Map<string, number>();
  for (let atom = 0; atom < copy.getAtoms(); atom++) {
    const symbol = copy.getAtomLabel(atom);
    if (copy.getConnAtoms(atom) >= 2) {
      const phrase = `${symbol}|${neighbourList(copy, atom)}`;
      centres.set(phrase, (centres.get(phrase) ?? 0) + 1);
    }
    const hydrogens = copy.getAllHydrogens(atom);
    if (hydrogens > 0) {
      const key = `${symbol}|${hydrogens}`;
      carriers.set(key, (carriers.get(key) ?? 0) + 1);
    }
  }
  const phrases: string[] = [];
  for (const [phrase, count] of centres) {
    const [symbol, neighbours] = phrase.split('|');
    phrases.push(
      count === 1
        ? `${symbol} is bonded to ${neighbours}`
        : `each of ${count} ${symbol} is bonded to ${neighbours}`,
    );
  }
  if (centres.size === 0 && copy.getAtoms() === 2) {
    phrases.push(
      `${copy.getAtomLabel(0)} is bonded to ${copy.getAtomLabel(1)}`,
    );
  }
  for (const [key, count] of carriers) {
    const [symbol, hydrogens] = key.split('|');
    const what = hydrogens === '1' ? 'one H' : `${hydrogens} H`;
    phrases.push(
      count === 1
        ? `${what} on the ${symbol}`
        : `${what} on each of ${count} ${symbol}`,
    );
  }
  return phrases.join('; ');
}

function neighbourList(molecule: Molecule, atom: number): string {
  const counts = new Map<string, number>();
  for (let index = 0; index < molecule.getConnAtoms(atom); index++) {
    const symbol = molecule.getAtomLabel(molecule.getConnAtom(atom, index));
    counts.set(symbol, (counts.get(symbol) ?? 0) + 1);
  }
  const parts: string[] = [];
  const symbols = [...counts.keys()].toSorted();
  for (const symbol of symbols) {
    const count = counts.get(symbol) ?? 0;
    parts.push(count === 1 ? `one ${symbol}` : `${count} ${symbol}`);
  }
  return parts.join(' and ');
}

function verdictReason(target: LewisTarget, verdict: LewisVerdict): string {
  switch (verdict.kind) {
    case 'empty':
      return 'Draw the structure in the editor.';
    case 'wrong-formula':
      return `The drawing is ${formulaText(verdict.drawn)}; the question asks for ${formulaText(target.formula)}. Check the atoms and the hydrogens.`;
    case 'wrong-connectivity':
      return 'All the atoms are there, but not bonded to the right neighbours. Where do the hydrogens sit?';
    case 'wrong-charge':
      return `The formal charges add up to ${formatSigned(verdict.netCharge)}; for ${formulaText(target.formula)} they must add up to ${formatSigned(verdict.expectedCharge)}.`;
    case 'invalid-atoms':
      return `The skeleton is right, but ${verdict.atoms.map((atom) => `${atom.symbol} has ${atom.electrons ?? '?'} electrons around it`).join(', ')}. Adjust the bonds or the formal charges.`;
    case 'correct':
      return verdict.listed
        ? 'Right: every atom has a full shell.'
        : 'Right: a valid Lewis structure. The solution shows the one with the fewest formal charges.';
    default:
      return '';
  }
}
