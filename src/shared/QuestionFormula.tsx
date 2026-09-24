import type { ReactElement } from 'react';
import { MF } from 'react-mf';

import { normalizeFormula } from '../chemistry/formula.ts';

/**
 * A formula as the list of a series names its question: subscripts and charge
 * drawn, in whatever notation the data writes the charge.
 * @param props - The formula.
 * @param props.formula - The formula, as the data writes it.
 * @returns The formula.
 */
export function QuestionFormula(props: { formula: string }): ReactElement {
  return <MF mf={normalizeFormula(props.formula)} />;
}
