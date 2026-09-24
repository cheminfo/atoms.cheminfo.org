import { Molecule } from 'openchemlib';

import { canonicalFormula } from './formula.ts';

/** How the electrons around one atom of a drawn structure add up. */
export interface LewisAtom {
  /** Index of the atom in the molecule. */
  index: number;
  symbol: string;
  /** Sum of the orders of its bonds, the bonds to hydrogen included. */
  bonds: number;
  /** Non-bonding electrons, `valence − charge − bonds`; null for a metal. */
  lonePairElectrons: number | null;
  /** Formal charge as drawn. */
  formalCharge: number;
  /** Electrons around it, `lone electrons + 2 × bonds`; null for a metal. */
  electrons: number | null;
  status: LewisAtomStatus;
}

/**
 * What the count around an atom says: a full shell, an expanded one a period-3
 * atom may take, boron's six, or something no Lewis structure allows.
 */
export type LewisAtomStatus =
  | 'full'
  | 'expanded'
  | 'incomplete'
  | 'short'
  | 'over'
  | 'odd'
  | 'negative'
  | 'unknown';

/** A structure to draw: the formula shown, and the structures accepted. */
export interface LewisTarget {
  formula: string;
  /** SMILES of the accepted drawings; the first is the one a solution shows. */
  accepted: readonly string[];
}

/** Why a drawing is right or wrong. */
export type LewisVerdict =
  | { kind: 'empty' }
  | { kind: 'wrong-formula'; drawn: string; expected: string }
  | { kind: 'wrong-connectivity' }
  | { kind: 'wrong-charge'; netCharge: number; expectedCharge: number }
  | { kind: 'invalid-atoms'; atoms: LewisAtom[] }
  | { kind: 'correct'; listed: boolean };

/**
 * Read the electrons around every non-hydrogen atom of a structure.
 * @param molecule - The structure, as drawn.
 * @returns One entry per non-hydrogen atom, in drawing order.
 */
export function readLewisAtoms(molecule: Molecule): LewisAtom[] {
  const copy = molecule.getCompactCopy();
  copy.ensureHelperArrays(Molecule.cHelperNeighbours);
  const atoms: LewisAtom[] = [];
  for (let atom = 0; atom < copy.getAtoms(); atom++) {
    atoms.push(readAtom(copy, atom));
  }
  return atoms;
}

/**
 * Grade a drawn structure against the structures a question accepts.
 *
 * A listed structure is right. So is any other drawing of the same skeleton —
 * the same atoms, bonded to the same neighbours, with the hydrogens on the same
 * atoms — with the right net charge, in which every atom has a shell a Lewis
 * structure allows: the charge-separated and the expanded-octet drawings of an
 * oxoacid are both Lewis structures of it.
 * @param target - What the question asks for.
 * @param idCode - The drawing, as the structure editor reports it.
 * @returns The verdict.
 */
export function gradeLewis(target: LewisTarget, idCode: string): LewisVerdict {
  if (idCode.trim() === '') return { kind: 'empty' };
  const drawn = Molecule.fromIDCode(idCode);
  if (drawn.getAllAtoms() === 0) return { kind: 'empty' };

  const expectedFormula = canonicalFormula(target.formula);
  const drawnFormula = canonicalFormula(drawn.getMolecularFormula().formula);
  if (drawnFormula !== expectedFormula) {
    return {
      kind: 'wrong-formula',
      drawn: drawn.getMolecularFormula().formula,
      expected: target.formula,
    };
  }

  const drawnIdCode = drawn.getIDCode();
  const references: Molecule[] = [];
  for (const smiles of target.accepted) {
    const reference = Molecule.fromSmiles(smiles);
    if (reference.getIDCode() === drawnIdCode) {
      return { kind: 'correct', listed: true };
    }
    references.push(reference);
  }

  const [reference] = references;
  if (reference === undefined) return { kind: 'wrong-connectivity' };
  if (skeletonKey(drawn) !== skeletonKey(reference)) {
    return { kind: 'wrong-connectivity' };
  }

  const netCharge = totalCharge(drawn);
  const expectedCharge = totalCharge(reference);
  if (netCharge !== expectedCharge) {
    return { kind: 'wrong-charge', netCharge, expectedCharge };
  }

  const invalid = readLewisAtoms(drawn).filter(
    (atom) => !ALLOWED_STATUS.has(atom.status),
  );
  if (invalid.length > 0) return { kind: 'invalid-atoms', atoms: invalid };
  return { kind: 'correct', listed: false };
}

/**
 * A key that two drawings share when they connect the same atoms to the same
 * neighbours and carry their hydrogens on the same atoms, whatever the bond
 * orders and the charges. The hydrogen count of each atom is written as its
 * mass, so the canonical code of an all-single-bond copy carries it.
 * @param molecule - A structure.
 * @returns The key.
 */
export function skeletonKey(molecule: Molecule): string {
  const source = molecule.getCompactCopy();
  source.ensureHelperArrays(Molecule.cHelperNeighbours);
  const skeleton = new Molecule(0, 0);
  const mapped = new Map<number, number>();
  for (let atom = 0; atom < source.getAtoms(); atom++) {
    const copy = skeleton.addAtom(source.getAtomicNo(atom));
    skeleton.setAtomMass(copy, 100 + source.getAllHydrogens(atom));
    mapped.set(atom, copy);
  }
  for (let bond = 0; bond < source.getBonds(); bond++) {
    const first = mapped.get(source.getBondAtom(0, bond));
    const second = mapped.get(source.getBondAtom(1, bond));
    if (first === undefined || second === undefined) continue;
    skeleton.addBond(first, second);
  }
  return skeleton.getIDCode();
}

/**
 * The valence electrons of a main-group element.
 * @param atomicNumber - Z.
 * @returns The electrons of its outer shell, or null for a transition metal,
 * a lanthanide or an actinide, which a Lewis structure does not describe.
 */
export function valenceElectrons(atomicNumber: number): number | null {
  if (atomicNumber <= 2) return atomicNumber;
  if (atomicNumber <= 10) return atomicNumber - 2;
  if (atomicNumber <= 18) return atomicNumber - 10;
  for (const [first, offset] of PERIOD_STARTS) {
    if (atomicNumber === first) return 1;
    if (atomicNumber === first + 1) return 2;
    if (atomicNumber >= first + offset && atomicNumber <= first + offset + 5) {
      return atomicNumber - (first + offset) + 3;
    }
  }
  return null;
}

const ALLOWED_STATUS: ReadonlySet<LewisAtomStatus> = new Set([
  'full',
  'expanded',
  'incomplete',
  'unknown',
]);

// The alkali metal opening periods 4 to 6, and how far after it group 13
// starts once the d (and f) block is passed.
const PERIOD_STARTS: ReadonlyArray<readonly [number, number]> = [
  [19, 12],
  [37, 12],
  [55, 26],
];

function readAtom(molecule: Molecule, atom: number): LewisAtom {
  const atomicNumber = molecule.getAtomicNo(atom);
  let bonds = molecule.getAllHydrogens(atom);
  for (
    let neighbour = 0;
    neighbour < molecule.getConnAtoms(atom);
    neighbour++
  ) {
    bonds += molecule.getConnBondOrder(atom, neighbour);
  }
  const formalCharge = molecule.getAtomCharge(atom);
  const symbol = molecule.getAtomLabel(atom);
  const valence = valenceElectrons(atomicNumber);
  if (valence === null) {
    return {
      index: atom,
      symbol,
      bonds,
      lonePairElectrons: null,
      formalCharge,
      electrons: null,
      status: 'unknown',
    };
  }
  const lonePairElectrons = valence - formalCharge - bonds;
  const electrons = lonePairElectrons + 2 * bonds;
  return {
    index: atom,
    symbol,
    bonds,
    lonePairElectrons,
    formalCharge,
    electrons,
    status: shellStatus(atomicNumber, lonePairElectrons, electrons),
  };
}

function shellStatus(
  atomicNumber: number,
  lonePairElectrons: number,
  electrons: number,
): LewisAtomStatus {
  if (lonePairElectrons < 0) return 'negative';
  if (lonePairElectrons % 2 !== 0) return 'odd';
  const full = atomicNumber <= 2 ? 2 : 8;
  if (electrons === full) return 'full';
  if (electrons > full) return atomicNumber <= 10 ? 'over' : 'expanded';
  // Boron and aluminium are stable with six: BF3, AlCl3.
  if (electrons === 6 && (atomicNumber === 5 || atomicNumber === 13)) {
    return 'incomplete';
  }
  return 'short';
}

function totalCharge(molecule: Molecule): number {
  let charge = 0;
  for (let atom = 0; atom < molecule.getAllAtoms(); atom++) {
    charge += molecule.getAtomCharge(atom);
  }
  return charge;
}
