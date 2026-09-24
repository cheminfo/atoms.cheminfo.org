import type { ParsedFormula } from './formula.ts';
import { FormulaError, atomicNumber, readFormula } from './formula.ts';
import { commonMassNumber } from './isotopes.ts';

/** One element of a formula, and the protons it brings. */
export interface ProtonRow {
  symbol: string;
  /** Atomic number Z. */
  atomicNumber: number;
  /** Atoms of it in the formula. */
  count: number;
  /** `atomicNumber × count`. */
  protons: number;
}

/** How the electrons of a formula add up. */
export interface ElectronCount {
  parsed: ParsedFormula;
  rows: ProtonRow[];
  /** Sum of the protons of every atom. */
  protons: number;
  /** Net charge of the formula. */
  charge: number;
  /** `protons − charge`. */
  electrons: number;
}

/** One isotope of a formula, and the neutrons it brings. */
export interface NeutronRow {
  symbol: string;
  massNumber: number;
  atomicNumber: number;
  /** `massNumber − atomicNumber`, the neutrons of one atom. */
  neutronsPerAtom: number;
  count: number;
  /** `neutronsPerAtom × count`. */
  neutrons: number;
}

/** How the neutrons of an isotopic formula add up. */
export interface NeutronCount {
  parsed: ParsedFormula;
  rows: NeutronRow[];
  neutrons: number;
}

/**
 * Count the electrons of a formula: every atom brings Z electrons, and the
 * charge takes them away (a cation) or adds them (an anion).
 * @param text - A formula, e.g. `NO3(1-)` or `Fe(3+)`.
 * @returns The count, with the arithmetic behind it.
 */
export function countElectrons(text: string): ElectronCount {
  const parsed = readFormula(text);
  const rows: ProtonRow[] = [];
  const bySymbol = new Map<string, ProtonRow>();
  for (const part of parsed.parts) {
    for (const atom of part.atoms) {
      let row = bySymbol.get(atom.symbol);
      if (row === undefined) {
        const z = atomicNumber(atom.symbol);
        row = { symbol: atom.symbol, atomicNumber: z, count: 0, protons: 0 };
        bySymbol.set(atom.symbol, row);
        rows.push(row);
      }
      row.count += atom.count;
      row.protons = row.count * row.atomicNumber;
    }
  }
  let protons = 0;
  for (const row of rows) protons += row.protons;
  return {
    parsed,
    rows,
    protons,
    charge: parsed.charge,
    electrons: protons - parsed.charge,
  };
}

/**
 * Count the neutrons of a formula in which every atom names its isotope.
 * @param text - An isotopic formula, e.g. `[238U][19F]6`.
 * @returns The count, isotope by isotope.
 * @throws {FormulaError} When an atom carries no mass number.
 */
export function countNeutrons(text: string): NeutronCount {
  const parsed = readFormula(text);
  const rows: NeutronRow[] = [];
  const byLabel = new Map<string, NeutronRow>();
  for (const part of parsed.parts) {
    for (const atom of part.atoms) {
      if (atom.massNumber === null) {
        throw new FormulaError(
          `${atom.symbol} carries no mass number: write it [${commonMassNumber(atom.symbol)}${atom.symbol}] to say which isotope it is.`,
        );
      }
      const label = `${atom.massNumber}${atom.symbol}`;
      let row = byLabel.get(label);
      if (row === undefined) {
        const z = atomicNumber(atom.symbol);
        if (atom.massNumber < z) {
          throw new FormulaError(
            `[${label}] has fewer nucleons (${atom.massNumber}) than protons (${z}).`,
          );
        }
        row = {
          symbol: atom.symbol,
          massNumber: atom.massNumber,
          atomicNumber: z,
          neutronsPerAtom: atom.massNumber - z,
          count: 0,
          neutrons: 0,
        };
        byLabel.set(label, row);
        rows.push(row);
      }
      row.count += atom.count;
      row.neutrons = row.count * row.neutronsPerAtom;
    }
  }
  let neutrons = 0;
  for (const row of rows) neutrons += row.neutrons;
  return { parsed, rows, neutrons };
}
