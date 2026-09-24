import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { ClickToCopy } from 'react-cheminfo/ui';

import { countElectrons } from '../chemistry/particles.ts';
import { compoundName } from '../data/names.ts';
import { formatSigned } from '../exercises/answers.ts';
import { CalculatorTable } from '../shared/CalculatorTable.tsx';
import { CopyableFormula } from '../shared/CopyableFormula.tsx';
import { ExerciseSeries } from '../shared/ExerciseSeries.tsx';
import { FormulaInput } from '../shared/FormulaInput.tsx';
import { FormulaProblem } from '../shared/FormulaProblem.tsx';
import { QuestionCompound } from '../shared/QuestionCompound.tsx';
import { QuestionFormula } from '../shared/QuestionFormula.tsx';
import { ToolPage } from '../shared/ToolPage.tsx';
import { ELECTRONS_TOOL } from '../tools/electrons.ts';

/**
 * Count the electrons of a molecule or an ion.
 * @returns The page.
 */
export function Electrons(): ReactElement {
  return (
    <ToolPage
      title="Electrons of a molecule or an ion"
      lead="Every atom brings as many electrons as its [[atomic number]]; a positive [[charge]] takes some away, a negative one adds them."
      playground={<ElectronCalculator />}
      exercises={
        <ExerciseSeries
          tab="electrons"
          tool={ELECTRONS_TOOL}
          label={(formula) => <QuestionFormula formula={formula} />}
          prompt={(formula) => (
            <>
              <QuestionCompound
                formula={formula}
                name={compoundName('electrons', formula)}
              />
              <p>How many electrons does it hold?</p>
            </>
          )}
        />
      }
    />
  );
}

function ElectronCalculator(): ReactElement {
  const [formula, setFormula] = useState('NO3(-)');
  const result = useMemo(() => {
    try {
      return { count: countElectrons(formula), error: null };
    } catch (error) {
      return { count: null, error };
    }
  }, [formula]);

  return (
    <div className="calculator">
      <FormulaInput
        label="Formula"
        value={formula}
        onChange={setFormula}
        placeholder="e.g. H2O, Fe(3+), SO4(2-)"
        helper="Write a charge in parentheses: Fe(3+), SO4(2-), NH4(+)."
      />
      {result.count === null ? (
        <FormulaProblem error={result.error} />
      ) : (
        <CalculatorTable
          headers={['Element', 'Z', 'Atoms', 'Protons']}
          footer={
            <>
              <tr>
                <th colSpan={3}>Protons</th>
                <td>{result.count.protons}</td>
              </tr>
              <tr>
                <th colSpan={3}>Charge</th>
                <td>{formatSigned(result.count.charge)}</td>
              </tr>
              <tr className="calculator__total">
                <th colSpan={3}>
                  Electrons of <CopyableFormula formula={formula} />
                </th>
                <ClickToCopy
                  as="td"
                  label="number of electrons"
                  value={String(result.count.electrons)}
                >
                  {result.count.electrons}
                </ClickToCopy>
              </tr>
            </>
          }
        >
          {result.count.rows.map((row) => (
            <tr key={row.symbol}>
              <td>{row.symbol}</td>
              <td>{row.atomicNumber}</td>
              <td>{row.count}</td>
              <td>{row.protons}</td>
            </tr>
          ))}
        </CalculatorTable>
      )}
    </div>
  );
}
