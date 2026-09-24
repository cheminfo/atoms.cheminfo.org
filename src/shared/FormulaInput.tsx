import { FormGroup, InputGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useId } from 'react';

interface FormulaInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /**
   * How to write what the box expects, under it.
   * @default undefined
   */
  helper?: string;
  /**
   * Placeholder written in the empty box.
   * @default undefined
   */
  placeholder?: string;
}

/**
 * A box to type a molecular formula into.
 * @param props - Its label, its value and what to do on a change.
 * @returns The box.
 */
export function FormulaInput(props: FormulaInputProps): ReactElement {
  const { label, value, onChange, helper, placeholder } = props;
  const id = useId();
  return (
    <FormGroup label={label} labelFor={id} helperText={helper}>
      <InputGroup
        id={id}
        value={value}
        placeholder={placeholder}
        onValueChange={onChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="formula-input"
      />
    </FormGroup>
  );
}
