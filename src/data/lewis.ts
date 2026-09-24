import type { LewisTarget } from '../chemistry/lewis.ts';

/**
 * The formulas a Lewis-structure question is drawn from, each with the SMILES
 * of the drawing a solution shows. Any other drawing of the same skeleton with
 * a shell every atom may take is accepted as well — see `gradeLewis`.
 *
 * Phosphorous acid is listed with both tautomers: HP(O)(OH)₂ is the one found
 * in the bottle, P(OH)₃ the one the formula H₃PO₃ suggests, and they are not
 * the same skeleton.
 *
 * Language-free: the names a question shows live in `locales/`.
 */
export const LEWIS_TARGETS: readonly LewisTarget[] = [
  { formula: 'HCN', accepted: ['C#N'] },
  { formula: 'HNO3', accepted: ['O=[N+](O)[O-]'] },
  { formula: 'H3PO4', accepted: ['O=P(O)(O)O'] },
  { formula: 'H2SO4', accepted: ['O=S(=O)(O)O'] },
  { formula: 'H2SO3', accepted: ['O=S(O)O'] },
  { formula: 'HClO', accepted: ['OCl'] },
  { formula: 'H2O2', accepted: ['OO'] },
  { formula: 'H3PO3', accepted: ['[H]P(=O)(O)O', 'OP(O)O'] },
  { formula: 'HClO2', accepted: ['O=ClO'] },
  { formula: 'HBO2', accepted: ['O=BO'] },
  { formula: 'H3BO3', accepted: ['OB(O)O'] },
  { formula: 'H2CO3', accepted: ['O=C(O)O'] },
  { formula: 'H4P2O7', accepted: ['O=P(O)(O)OP(=O)(O)O'] },
  { formula: 'HCOOH', accepted: ['O=CO'] },
  { formula: 'CH3COOH', accepted: ['CC(=O)O'] },
  { formula: 'H2C2O4', accepted: ['O=C(O)C(=O)O'] },
  { formula: 'HClO3', accepted: ['O=Cl(=O)O'] },
  { formula: 'HClO4', accepted: ['O=Cl(=O)(=O)O'] },
  { formula: 'HBrO2', accepted: ['O=BrO'] },
];
