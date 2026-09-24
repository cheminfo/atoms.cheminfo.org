import { FormGroup, HTMLSelect } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useId, useState } from 'react';
import { formatDecimal } from 'react-cheminfo/core';
import { ClickToCopy } from 'react-cheminfo/ui';

import type { TwoIsotopeElement } from '../chemistry/isotopes.ts';
import {
  TWO_ISOTOPE_ELEMENTS,
  twoIsotopeElement,
} from '../chemistry/isotopes.ts';
import { CalculatorTable } from '../shared/CalculatorTable.tsx';
import { ExerciseSeries } from '../shared/ExerciseSeries.tsx';
import { ToolPage } from '../shared/ToolPage.tsx';
import {
  ISOTOPES_TOOL,
  MASS_DECIMALS,
  expectedAbundances,
  isotopeLabel,
} from '../tools/isotopes.ts';

/**
 * Work out the natural abundances of an element with two stable isotopes.
 * @returns The page.
 */
export function Isotopes(): ReactElement {
  return (
    <ToolPage
      title="Isotopic abundance from the atomic mass"
      lead="The [[atomic mass]] of an element is the mean of its isotopic masses weighted by their [[abundance|abundances]]. With two isotopes, that one equation gives both."
      playground={<IsotopeCalculator />}
      exercises={
        <ExerciseSeries
          tab="isotopes"
          tool={ISOTOPES_TOOL}
          label={(element) => element.name}
          prompt={(element) => <IsotopeQuestion element={element} />}
        />
      }
    />
  );
}

function IsotopeQuestion(props: { element: TwoIsotopeElement }): ReactElement {
  const { element } = props;
  const [lighter, heavier] = element.isotopes;
  return (
    <div>
      <p>
        {element.name} has two stable isotopes and an atomic mass of{' '}
        <strong>{formatDecimal(element.atomicMass, MASS_DECIMALS)} u</strong>.
        What is the natural abundance of each?
      </p>
      <ul className="question-card__data">
        <li>
          {isotopeLabel(lighter.massNumber, element.symbol)}:{' '}
          {formatDecimal(lighter.mass, MASS_DECIMALS)} u
        </li>
        <li>
          {isotopeLabel(heavier.massNumber, element.symbol)}:{' '}
          {formatDecimal(heavier.mass, MASS_DECIMALS)} u
        </li>
      </ul>
    </div>
  );
}

function IsotopeCalculator(): ReactElement {
  const [symbol, setSymbol] = useState('Cl');
  const id = useId();
  const element = twoIsotopeElement(symbol) ?? TWO_ISOTOPE_ELEMENTS[0];
  if (element === undefined) return <p>No element has two stable isotopes.</p>;
  const [lighter, heavier] = element.isotopes;
  const { lighter: x } = expectedAbundances(element);

  return (
    <div className="calculator">
      <FormGroup label="Element" labelFor={id}>
        <HTMLSelect
          id={id}
          value={element.symbol}
          onChange={(event) => {
            setSymbol(event.currentTarget.value);
          }}
          options={TWO_ISOTOPE_ELEMENTS.map((entry) => ({
            value: entry.symbol,
            label: `${entry.name} (${entry.symbol})`,
          }))}
        />
      </FormGroup>
      <CalculatorTable
        headers={['Isotope', 'Mass (u)', 'Abundance (%)']}
        footer={
          <tr className="calculator__total">
            <th>Atomic mass M</th>
            <ClickToCopy
              as="td"
              label="atomic mass"
              value={formatDecimal(element.atomicMass, MASS_DECIMALS)}
            >
              {formatDecimal(element.atomicMass, MASS_DECIMALS)} u
            </ClickToCopy>
          </tr>
        }
      >
        {element.isotopes.map((isotope) => (
          <tr key={isotope.massNumber}>
            <td>{isotopeLabel(isotope.massNumber, element.symbol)}</td>
            <td>{formatDecimal(isotope.mass, MASS_DECIMALS)}</td>
            <td>{formatDecimal(isotope.abundance, 4)}</td>
          </tr>
        ))}
      </CalculatorTable>
      <p className="calculator__working">
        x = (m₂ − M) / (m₂ − m₁) = ({formatDecimal(heavier.mass, MASS_DECIMALS)}{' '}
        − {formatDecimal(element.atomicMass, MASS_DECIMALS)}) / (
        {formatDecimal(heavier.mass, MASS_DECIMALS)} −{' '}
        {formatDecimal(lighter.mass, MASS_DECIMALS)}) ={' '}
        {formatDecimal(x / 100, 4)}
      </p>
    </div>
  );
}
