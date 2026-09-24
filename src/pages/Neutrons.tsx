import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { MF } from 'react-mf';

import { countNeutrons } from '../chemistry/particles.ts';
import { compoundName } from '../data/names.ts';
import { CalculatorTable } from '../shared/CalculatorTable.tsx';
import { ExerciseSeries } from '../shared/ExerciseSeries.tsx';
import { FormulaInput } from '../shared/FormulaInput.tsx';
import { FormulaProblem } from '../shared/FormulaProblem.tsx';
import { QuestionCompound } from '../shared/QuestionCompound.tsx';
import { QuestionFormula } from '../shared/QuestionFormula.tsx';
import { ToolPage } from '../shared/ToolPage.tsx';
import { NEUTRONS_TOOL } from '../tools/neutrons.ts';

/**
 * Count the neutrons of a formula whose every atom names its isotope.
 * @returns The page.
 */
export function Neutrons(): ReactElement {
  return (
    <ToolPage
      title="Neutrons of an isotopic formula"
      lead="The [[mass number]] A counts the nucleons of an atom, the [[atomic number]] Z its protons: every atom brings A − Z neutrons."
      playground={<NeutronCalculator />}
      exercises={
        <ExerciseSeries
          tab="neutrons"
          tool={NEUTRONS_TOOL}
          label={(formula) => <QuestionFormula formula={formula} />}
          prompt={(formula) => (
            <>
              <QuestionCompound
                formula={formula}
                name={compoundName('neutrons', formula)}
              />
              <p>How many neutrons does it hold?</p>
            </>
          )}
        />
      }
    />
  );
}

function NeutronCalculator(): ReactElement {
  const [formula, setFormula] = useState('[238U][19F]6');
  const result = useMemo(() => {
    try {
      return { count: countNeutrons(formula), error: null };
    } catch (error) {
      return { count: null, error };
    }
  }, [formula]);

  return (
    <div className="calculator">
      <FormulaInput
        label="Isotopic formula"
        value={formula}
        onChange={setFormula}
        placeholder="e.g. [13C]O2, [2H]2O"
        helper="Write every atom with its mass number in brackets: [12C], [35Cl], [238U]."
      />
      {result.count === null ? (
        <FormulaProblem error={result.error} />
      ) : (
        <CalculatorTable
          headers={['Isotope', 'A', 'Z', 'A − Z', 'Atoms', 'Neutrons']}
          footer={
            <tr className="calculator__total">
              <th colSpan={5}>
                Neutrons of <MF mf={result.count.parsed.formula} />
              </th>
              <td>{result.count.neutrons}</td>
            </tr>
          }
        >
          {result.count.rows.map((row) => (
            <tr key={`${row.massNumber}${row.symbol}`}>
              <td>
                <MF mf={`[${row.massNumber}${row.symbol}]`} />
              </td>
              <td>{row.massNumber}</td>
              <td>{row.atomicNumber}</td>
              <td>{row.neutronsPerAtom}</td>
              <td>{row.count}</td>
              <td>{row.neutrons}</td>
            </tr>
          ))}
        </CalculatorTable>
      )}
    </div>
  );
}
