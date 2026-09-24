import type { ReferenceSection } from 'react-cheminfo/ui';

/** The rules the tools apply, one section per tool, as the cheatsheet prints them. */
export const CHEATSHEET: readonly ReferenceSection[] = [
  {
    id: 'particles',
    title: 'Protons, neutrons, electrons',
    rows: [
      {
        syntax: 'Z',
        description: 'Atomic number: the protons of the nucleus.',
      },
      {
        syntax: 'A',
        description:
          'Mass number: protons plus neutrons, written top left, ¹³C.',
      },
      { syntax: 'N = A − Z', description: 'The neutrons of one atom.' },
      {
        syntax: 'e⁻ = ΣZ − q',
        description: 'The electrons of a formula of charge q.',
      },
      {
        syntax: 'Fe(3+), SO4(2-)',
        description: 'How to type a charge into a calculator.',
      },
      {
        syntax: '[13C]O2',
        description: 'How to type an isotope: its mass number in brackets.',
      },
    ],
  },
  {
    id: 'isotopes',
    title: 'Isotopes',
    rows: [
      {
        syntax: 'M = Σ xᵢ · mᵢ',
        description:
          'Atomic mass: isotopic masses weighted by their abundances.',
      },
      {
        syntax: 'Σ xᵢ = 100 %',
        description: 'The abundances of an element add up to 100 %.',
      },
      {
        syntax: 'x = (m₂ − M) / (m₂ − m₁)',
        description: 'Two isotopes: the abundance of the lighter one.',
      },
    ],
  },
  {
    id: 'lewis',
    title: 'Lewis structures',
    rows: [
      {
        syntax: 'H 1 · C 4 · N 5 · O 6 · F 7',
        description: 'Valence electrons; P and S as N and O, Cl as F.',
      },
      {
        syntax: 'FC = V − L − B',
        description:
          'Formal charge: valence, minus lone-pair electrons, minus bonds.',
      },
      {
        syntax: '8, and 2 for H',
        description: 'The electrons around a second-row atom: an octet.',
      },
      {
        syntax: 'more than 8',
        description:
          'An expanded shell, allowed from the third row on: P, S, Cl.',
      },
      { syntax: '6 on B', description: 'Boron is stable with six, as in BF₃.' },
      {
        syntax: 'ΣFC = q',
        description: 'The formal charges add up to the charge of the molecule.',
      },
    ],
  },
  {
    id: 'oxidation',
    title: 'Oxidation states',
    rows: [
      {
        syntax: 'Σ nᵢ · OSᵢ = q',
        description: 'The sum rule: states times atom counts give the charge.',
      },
      { syntax: '0', description: 'An element on its own: O₂, N₂, S₈, Fe.' },
      {
        syntax: 'H +1',
        description: 'Except in a metal hydride such as NaH, where it is −1.',
      },
      {
        syntax: 'O −2',
        description: 'Except in a peroxide such as H₂O₂, where it is −1.',
      },
      {
        syntax: 'F −1',
        description: 'Always: fluorine is the most electronegative element.',
      },
      {
        syntax: 'group 1 +1, group 2 +2',
        description: 'Alkali and alkaline-earth metals; aluminium is +3.',
      },
    ],
  },
];
