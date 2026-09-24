import { FormGroup, InputGroup } from '@blueprintjs/core';
import type { KeyboardEvent, ReactElement } from 'react';
import { useId } from 'react';

import type { AnswerField, Answers } from '../exercises/types.ts';

interface AnswerFieldsProps {
  fields: readonly AnswerField[];
  answers: Answers;
  onChange: (key: string, value: string) => void;
  /** Called on Enter, which checks the answer. */
  onSubmit: () => void;
}

/**
 * The boxes a question asks the student to fill, side by side.
 * @param props - The fields, what is typed in them, and what to do on a change.
 * @returns The boxes.
 */
export function AnswerFields(props: AnswerFieldsProps): ReactElement {
  const { fields, answers, onChange, onSubmit } = props;
  const prefix = useId();

  function submitOnEnter(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') onSubmit();
  }

  return (
    <div className="answer-fields">
      {fields.map((field) => {
        const id = `${prefix}-${field.key}`;
        return (
          <FormGroup
            key={field.key}
            label={field.label}
            labelFor={id}
            className="answer-fields__field"
          >
            <InputGroup
              id={id}
              value={answers[field.key] ?? ''}
              placeholder={field.placeholder}
              onValueChange={(value) => {
                onChange(field.key, value);
              }}
              onKeyDown={submitOnEnter}
              inputMode={field.inputMode ?? 'decimal'}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </FormGroup>
        );
      })}
    </div>
  );
}
