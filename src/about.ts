/**
 * What this site says about itself: the record the shared About page is drawn
 * from. The prose limits are checked by `aboutProblems` in the test suite, so
 * this file never grows into a page nobody reads.
 */

import { BUILD_INFO } from 'react-cheminfo/build-info';
import type { AboutContent } from 'react-cheminfo/core';
import {
  OPENCHEMLIB_WORK,
  PLATFORM_WORK,
  TEACHING_WORK,
} from 'react-cheminfo/core';

/** The About record of atoms.cheminfo.org. */
export const ABOUT: AboutContent = {
  siteId: 'atoms',
  // Which release, built when, from which commit: the build says so.
  build: BUILD_INFO,
  what: 'Count the electrons and neutrons of a formula, work out isotopic abundances, draw Lewis structures and assign oxidation states.',
  can: [
    'Count the electrons of any molecule or ion, its charge taken into account.',
    'Count the neutrons of a formula whose atoms name their isotope.',
    'Work out the natural abundances of an element from its atomic mass.',
    'Draw a Lewis structure and read the shell of every atom.',
    'Give every element of a compound its oxidation state, checked by the sum rule.',
    'Hand out a series of questions as a link, or frame it in a course page.',
  ],
  paragraphs: [
    'Every answer is computed rather than stored: electrons and neutrons are added up from atomic and mass numbers, abundances solved from isotopic masses. A formula typed into a calculator gets the same working a question shows.',
    'A series of questions is drawn from its seed, and the seed is in the address, so the link on screen reopens the same questions for anyone: a teacher hands one series to a whole class.',
  ],
  people: [{ name: 'Luc Patiny' }],
  providedBy: ['epfl'],
  credits: [
    'mass-tools',
    'openchemlib',
    'react-ocl',
    'react-mf',
    'ml-xsadd',
    'react-cheminfo',
    'blueprint',
    'preact-signals',
    'react',
    'vite',
  ],
  cite: [PLATFORM_WORK, TEACHING_WORK, OPENCHEMLIB_WORK],
};
