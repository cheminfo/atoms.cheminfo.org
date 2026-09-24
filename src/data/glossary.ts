import type { Glossary } from 'react-cheminfo/core';

/**
 * The words the explanations of this site are written in, each defined in one
 * paragraph with a worked example. A `[[term]]` marker in any description,
 * hint or solution opens the entry it names; keys are the lowercased marker.
 */
export const GLOSSARY: Glossary = {
  'atomic number': {
    title: 'Atomic number (Z)',
    summary:
      'The number of protons in the nucleus of an atom: it is what makes the atom the element it is. A neutral atom has as many electrons as protons.',
    examples: [
      {
        code: 'C',
        note: 'Z = 6: six protons, and six electrons in the neutral atom.',
      },
      {
        code: 'Fe³⁺',
        note: 'Z = 26 protons; the 3+ charge leaves 23 electrons.',
      },
    ],
  },
  charge: {
    title: 'Charge of an ion',
    summary:
      'How many electrons an ion has lost (a positive charge) or gained (a negative one) compared with its protons.',
    examples: [
      { code: 'Na⁺', note: '11 protons, 10 electrons.' },
      { code: 'SO₄²⁻', note: '16 + 4 × 8 = 48 protons, 50 electrons.' },
    ],
  },
  'mass number': {
    title: 'Mass number (A)',
    summary:
      'The number of nucleons of an atom: its protons plus its neutrons. It is written at the top left of the symbol.',
    examples: [
      { code: '¹²C', note: 'A = 12: 6 protons and 6 neutrons.' },
      { code: '¹³C', note: 'A = 13: 6 protons and 7 neutrons.' },
      { code: '²³⁸U', note: 'A = 238: 92 protons and 146 neutrons.' },
    ],
  },
  'atomic mass': {
    title: 'Atomic mass',
    summary:
      'The mean mass of the atoms of an element as found in nature, in u: the mass of each isotope, weighted by its abundance.',
    examples: [
      {
        code: 'Cl: 35.453 u',
        note: '75.76 % of ³⁵Cl at 34.969 u and 24.24 % of ³⁷Cl at 36.966 u.',
      },
    ],
  },
  abundance: {
    title: 'Natural abundance',
    summary:
      'The share of the atoms of an element that are one given isotope, in percent. The abundances of an element add up to 100 %.',
    examples: [
      {
        code: '⁷⁹Br, ⁸¹Br',
        note: '50.69 % and 49.31 %: bromine is nearly half and half.',
      },
      { code: '¹²C, ¹³C', note: '98.93 % and 1.07 %.' },
    ],
  },
  'valence electrons': {
    title: 'Valence electrons',
    summary:
      'The electrons of the outer shell of an atom, the ones it bonds with. For a main-group element, the last digit of its group number.',
    examples: [
      { code: 'C, N, O, Cl', note: '4, 5, 6 and 7 valence electrons.' },
      {
        code: 'H₂SO₄',
        note: '2 × 1 + 6 + 4 × 6 = 32 valence electrons to place.',
      },
    ],
  },
  'lone pair': {
    title: 'Lone pair',
    summary:
      'Two valence electrons of one atom that it does not share in a bond. A Lewis structure draws them as a pair of dots or a bar.',
    examples: [
      { code: 'H₂O', note: 'Two lone pairs on the oxygen.' },
      { code: 'NH₃', note: 'One lone pair on the nitrogen.' },
    ],
  },
  'formal charge': {
    title: 'Formal charge',
    summary:
      'The charge an atom carries in a Lewis structure if every bond is shared equally: its valence electrons, minus its lone-pair electrons, minus its bonds. The formal charges of a molecule add up to its charge.',
    examples: [
      {
        code: 'HNO₃',
        note: 'N +1 and one O −1: nitrogen cannot hold more than eight electrons.',
      },
      {
        code: '⁻C≡O⁺',
        note: 'Carbon monoxide: each atom reaches its octet only with these charges.',
      },
    ],
  },
  'oxidation state': {
    title: 'Oxidation state',
    summary:
      'The charge an atom would carry if every bond were ionic, its electrons all given to the more electronegative partner.',
    examples: [
      { code: 'H₂O', note: 'H +1 and O −2.' },
      { code: 'H₂O₂', note: 'O −1: the O–O bond is shared equally.' },
      { code: 'KMnO₄', note: '+1 + Mn + 4 × (−2) = 0, so Mn is +7.' },
    ],
  },
};
