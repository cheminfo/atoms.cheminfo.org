import type { ExerciseLevel } from 'react-cheminfo/core';

/** A compound, and the oxidation state of each of its elements. */
export interface OxidationCompound {
  /** The formula as it is shown, charge included, e.g. `NO3-`. */
  formula: string;
  level: ExerciseLevel;
  /** Oxidation state of every element of the formula. */
  oxidation: Readonly<Record<string, number>>;
}

/**
 * The compounds an oxidation-state question is drawn from. Every entry passes
 * the sum rule — the oxidation states times the atom counts add up to the
 * charge — which the test suite checks.
 *
 * Language-free: the names a question shows live in `locales/`.
 */
export const OXIDATION_COMPOUNDS: readonly OxidationCompound[] = [
  { formula: 'H2O', level: 'beginner', oxidation: { H: 1, O: -2 } },
  { formula: 'H2O2', level: 'beginner', oxidation: { H: 1, O: -1 } },
  { formula: 'NaCl', level: 'beginner', oxidation: { Na: 1, Cl: -1 } },
  { formula: 'H3PO4', level: 'beginner', oxidation: { H: 1, P: 5, O: -2 } },
  { formula: 'NO3-', level: 'beginner', oxidation: { N: 5, O: -2 } },
  {
    formula: 'KMnO4',
    level: 'intermediate',
    oxidation: { K: 1, Mn: 7, O: -2 },
  },
  { formula: 'NH4+', level: 'beginner', oxidation: { N: -3, H: 1 } },
  {
    formula: 'Fe2(SO4)3',
    level: 'intermediate',
    oxidation: { Fe: 3, S: 6, O: -2 },
  },
  { formula: 'KOH', level: 'beginner', oxidation: { K: 1, O: -2, H: 1 } },
  {
    formula: 'K2Cr2O7',
    level: 'intermediate',
    oxidation: { K: 1, Cr: 6, O: -2 },
  },
  { formula: 'KH', level: 'beginner', oxidation: { K: 1, H: -1 } },
  { formula: 'PH3', level: 'beginner', oxidation: { P: -3, H: 1 } },
  { formula: 'N2O', level: 'beginner', oxidation: { N: 1, O: -2 } },
  { formula: 'N2', level: 'beginner', oxidation: { N: 0 } },
  { formula: 'HPO3', level: 'beginner', oxidation: { H: 1, P: 5, O: -2 } },
  { formula: 'HNO3', level: 'beginner', oxidation: { H: 1, N: 5, O: -2 } },
  { formula: 'Sb2O5', level: 'intermediate', oxidation: { Sb: 5, O: -2 } },
  { formula: 'NO2', level: 'beginner', oxidation: { N: 4, O: -2 } },
  { formula: 'SF6', level: 'beginner', oxidation: { S: 6, F: -1 } },
  { formula: 'H2S', level: 'beginner', oxidation: { H: 1, S: -2 } },
  {
    formula: 'Cu(NO3)2',
    level: 'intermediate',
    oxidation: { Cu: 2, N: 5, O: -2 },
  },
  { formula: 'NH4Cl', level: 'beginner', oxidation: { N: -3, H: 1, Cl: -1 } },
  { formula: 'NaNH2', level: 'beginner', oxidation: { Na: 1, N: -3, H: 1 } },
  { formula: 'NH3', level: 'beginner', oxidation: { N: -3, H: 1 } },
  { formula: 'NiO2', level: 'beginner', oxidation: { Ni: 4, O: -2 } },
  {
    formula: '(NH4)2HPO4',
    level: 'intermediate',
    oxidation: { N: -3, H: 1, P: 5, O: -2 },
  },
  { formula: 'ClO4-', level: 'beginner', oxidation: { Cl: 7, O: -2 } },
  { formula: 'S2O3-2', level: 'intermediate', oxidation: { S: 2, O: -2 } },
  {
    formula: 'NH2CONH2',
    level: 'intermediate',
    oxidation: { N: -3, H: 1, C: 4, O: -2 },
  },
  { formula: 'CH3CH3', level: 'beginner', oxidation: { C: -3, H: 1 } },
  {
    formula: 'Mg(NO3)2',
    level: 'intermediate',
    oxidation: { Mg: 2, N: 5, O: -2 },
  },
  {
    formula: 'Al2(SO4)3',
    level: 'intermediate',
    oxidation: { Al: 3, S: 6, O: -2 },
  },
  { formula: 'CaCrO4', level: 'beginner', oxidation: { Ca: 2, Cr: 6, O: -2 } },
  {
    formula: 'Al(H2PO4)3',
    level: 'intermediate',
    oxidation: { Al: 3, H: 1, P: 5, O: -2 },
  },
  {
    formula: 'Ag2CO3',
    level: 'intermediate',
    oxidation: { Ag: 1, C: 4, O: -2 },
  },
  {
    formula: 'Na2S2O3',
    level: 'intermediate',
    oxidation: { Na: 1, S: 2, O: -2 },
  },
  { formula: 'Cr2S3', level: 'intermediate', oxidation: { Cr: 3, S: -2 } },
  {
    formula: 'K2FeO4',
    level: 'intermediate',
    oxidation: { K: 1, Fe: 6, O: -2 },
  },
  {
    formula: 'NaHSO4',
    level: 'intermediate',
    oxidation: { Na: 1, H: 1, S: 6, O: -2 },
  },
  {
    formula: 'NaSCN',
    level: 'intermediate',
    oxidation: { Na: 1, S: -2, C: 4, N: -3 },
  },
  {
    formula: 'NaHCO3',
    level: 'intermediate',
    oxidation: { Na: 1, H: 1, C: 4, O: -2 },
  },
  { formula: 'FePO4', level: 'beginner', oxidation: { Fe: 3, P: 5, O: -2 } },
  {
    formula: '(NH4)2MoO4',
    level: 'intermediate',
    oxidation: { H: 1, N: -3, Mo: 6, O: -2 },
  },
  {
    formula: 'Na3Co(NO2)6',
    level: 'intermediate',
    oxidation: { Na: 1, Co: 3, N: 3, O: -2 },
  },
  { formula: 'CS2', level: 'beginner', oxidation: { C: 4, S: -2 } },
  { formula: 'KClO3', level: 'beginner', oxidation: { K: 1, Cl: 5, O: -2 } },
  {
    formula: 'Pb(NO3)2',
    level: 'intermediate',
    oxidation: { Pb: 2, N: 5, O: -2 },
  },
  { formula: 'COCl2', level: 'beginner', oxidation: { C: 4, O: -2, Cl: -1 } },
  { formula: 'HBrO', level: 'beginner', oxidation: { H: 1, Br: 1, O: -2 } },
  { formula: 'AlPO4', level: 'beginner', oxidation: { Al: 3, P: 5, O: -2 } },
  { formula: 'K3N', level: 'beginner', oxidation: { K: 1, N: -3 } },
  { formula: 'S8', level: 'beginner', oxidation: { S: 0 } },
  { formula: 'O2', level: 'beginner', oxidation: { O: 0 } },
  { formula: 'NaH', level: 'beginner', oxidation: { Na: 1, H: -1 } },
  { formula: 'NaOH', level: 'beginner', oxidation: { Na: 1, O: -2, H: 1 } },
  { formula: 'LiOH', level: 'beginner', oxidation: { Li: 1, O: -2, H: 1 } },
  { formula: 'Cl2', level: 'beginner', oxidation: { Cl: 0 } },
  { formula: 'Br2', level: 'beginner', oxidation: { Br: 0 } },
  { formula: 'CO2', level: 'beginner', oxidation: { C: 4, O: -2 } },
  { formula: 'Na2CO3', level: 'beginner', oxidation: { Na: 1, C: 4, O: -2 } },
];
