import { Callout } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { errorMessage } from 'react-cheminfo/core';

/**
 * Why a formula could not be worked out, in the words the chemistry gave.
 * @param props - What was thrown.
 * @param props.error - The error.
 * @returns A warning callout.
 */
export function FormulaProblem(props: { error: unknown }): ReactElement {
  return (
    <Callout intent="warning" icon="issue" className="formula-problem">
      {errorMessage(props.error)}
    </Callout>
  );
}
