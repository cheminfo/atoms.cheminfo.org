import type { ReactElement } from 'react';
import { ClickToCopy } from 'react-cheminfo/ui';
import { MF } from 'react-mf';

import { formulaHtml, normalizeFormula } from '../chemistry/formula.ts';

interface CopyableFormulaProps {
  /** The formula, as the data writes it. */
  formula: string;
  /**
   * The element drawn: a cell of its own inside a table.
   * @default 'span'
   */
  as?: 'span' | 'td';
  /**
   * What the value is called in the hover title.
   * @default 'formula'
   */
  label?: string;
}

/**
 * A formula drawn with its subscripts and copied by a click: as text for
 * another tool, and as markup so a paste into a document keeps the subscripts.
 * @param props - The formula, the element it is drawn as, and its label.
 * @returns The formula.
 */
export function CopyableFormula(props: CopyableFormulaProps): ReactElement {
  const { formula, as = 'span', label = 'formula' } = props;
  const written = normalizeFormula(formula);
  return (
    <ClickToCopy
      as={as}
      label={label}
      value={{ text: formula, html: formulaHtml(formula) }}
    >
      <MF mf={written} />
    </ClickToCopy>
  );
}
