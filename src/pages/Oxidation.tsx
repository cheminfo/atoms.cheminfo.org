import { FormGroup, InputGroup, Tag } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useId, useMemo, useState } from 'react';

import { atomCounts, readFormula } from '../chemistry/formula.ts';
import { sumRule } from '../chemistry/oxidation.ts';
import { compoundName } from '../data/names.ts';
import { formatSigned, parseInteger } from '../exercises/answers.ts';
import { CalculatorTable } from '../shared/CalculatorTable.tsx';
import { ExerciseSeries } from '../shared/ExerciseSeries.tsx';
import { FormulaInput } from '../shared/FormulaInput.tsx';
import { FormulaProblem } from '../shared/FormulaProblem.tsx';
import { QuestionCompound } from '../shared/QuestionCompound.tsx';
import { QuestionFormula } from '../shared/QuestionFormula.tsx';
import { ToolPage } from '../shared/ToolPage.tsx';
import { OXIDATION_TOOL } from '../tools/oxidation.ts';

/**
 * Give every element of a compound its oxidation state.
 * @returns The page.
 */
export function Oxidation(): ReactElement {
  return (
    <ToolPage
      title="Oxidation states and the sum rule"
      lead="Every [[oxidation state]], times its number of atoms, adds up to the charge of the formula. Start from the elements whose state rarely changes."
      playground={<SumRuleChecker />}
      exercises={
        <ExerciseSeries
          tab="oxidation"
          tool={OXIDATION_TOOL}
          label={(compound) => <QuestionFormula formula={compound.formula} />}
          prompt={(compound) => (
            <>
              <QuestionCompound
                formula={compound.formula}
                name={compoundName('oxidation', compound.formula)}
              />
              <p>Give the oxidation state of each of its elements.</p>
            </>
          )}
        />
      }
    />
  );
}

function SumRuleChecker(): ReactElement {
  const [formula, setFormula] = useState('KMnO4');
  const [typed, setTyped] = useState<Record<string, string>>({
    K: '+1',
    O: '-2',
  });
  const prefix = useId();

  const symbols = useMemo(() => {
    try {
      return {
        list: [...atomCounts(readFormula(formula)).keys()],
        error: null,
      };
    } catch (error) {
      return { list: null, error };
    }
  }, [formula]);

  if (symbols.list === null) {
    return (
      <div className="calculator">
        <FormulaInput label="Formula" value={formula} onChange={setFormula} />
        <FormulaProblem error={symbols.error} />
      </div>
    );
  }

  const states: Record<string, number | null> = {};
  for (const symbol of symbols.list) {
    states[symbol] = parseInteger(typed[symbol] ?? '');
  }
  const rule = sumRule(formula, states);
  const complete = rule.terms.every((term) => term.state !== null);

  return (
    <div className="calculator">
      <FormulaInput
        label="Formula"
        value={formula}
        onChange={setFormula}
        placeholder="e.g. K2Cr2O7, NO3-, H2O2"
        helper="Type the states you know; the sum rule shows what the others must add up to."
      />
      <div className="answer-fields">
        {symbols.list.map((symbol) => (
          <FormGroup
            key={symbol}
            label={`State of ${symbol}`}
            labelFor={`${prefix}-${symbol}`}
            className="answer-fields__field"
          >
            <InputGroup
              id={`${prefix}-${symbol}`}
              value={typed[symbol] ?? ''}
              placeholder="e.g. +2"
              inputMode="decimal"
              autoComplete="off"
              onValueChange={(value) => {
                setTyped({ ...typed, [symbol]: value });
              }}
            />
          </FormGroup>
        ))}
      </div>
      <CalculatorTable
        headers={['Element', 'Atoms', 'State', 'Atoms × state']}
        footer={
          <tr className="calculator__total">
            <th colSpan={3}>
              Sum, which must equal the charge {formatSigned(rule.charge)}
            </th>
            <td>
              {complete
                ? formatSigned(rule.sum)
                : `${formatSigned(rule.sum)} + ?`}{' '}
              {complete ? (
                <Tag minimal intent={rule.holds ? 'success' : 'danger'}>
                  {rule.holds ? 'holds' : 'does not hold'}
                </Tag>
              ) : null}
            </td>
          </tr>
        }
      >
        {rule.terms.map((term) => (
          <tr key={term.symbol}>
            <td>{term.symbol}</td>
            <td>{term.count}</td>
            <td>{term.state === null ? '?' : formatSigned(term.state)}</td>
            <td>
              {term.state === null
                ? '?'
                : formatSigned(term.count * term.state)}
            </td>
          </tr>
        ))}
      </CalculatorTable>
    </div>
  );
}
