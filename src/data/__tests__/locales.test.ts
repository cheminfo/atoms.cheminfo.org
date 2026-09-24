import { expect, test } from 'vitest';

import { ELECTRON_FORMULAS } from '../electrons.ts';
import { LEWIS_TARGETS } from '../lewis.ts';
import { NAMES_EN } from '../locales/en.ts';
import { NAMES_FR } from '../locales/fr.ts';
import { NEUTRON_FORMULAS } from '../neutrons.ts';
import { OXIDATION_COMPOUNDS } from '../oxidation.ts';

const POOLS = {
  electrons: ELECTRON_FORMULAS,
  neutrons: NEUTRON_FORMULAS,
  lewis: LEWIS_TARGETS.map((target) => target.formula),
  oxidation: OXIDATION_COMPOUNDS.map((compound) => compound.formula),
};

test('every compound of every pool is named in English and in French', () => {
  for (const [tool, formulas] of Object.entries(POOLS)) {
    const key = tool as keyof typeof POOLS;
    expect({ tool, en: Object.keys(NAMES_EN[key]) }).toStrictEqual({
      tool,
      en: [...formulas],
    });
    expect({ tool, fr: Object.keys(NAMES_FR[key]) }).toStrictEqual({
      tool,
      fr: [...formulas],
    });
  }
});
