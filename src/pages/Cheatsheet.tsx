import type { ReactElement } from 'react';
import { ReferenceGrid } from 'react-cheminfo/ui';

import { CHEATSHEET } from '../data/cheatsheet.ts';

/**
 * The rules the tools apply, on one printable page.
 * @returns The page.
 */
export function Cheatsheet(): ReactElement {
  return (
    <div className="cheatsheet">
      <header className="page-head">
        <h1 className="page__title">The rules on one page</h1>
        <p className="page__lead">
          What each tool of this site applies, in the order a course meets it.
          Print it: the chrome is left out.
        </p>
      </header>
      <ReferenceGrid sections={CHEATSHEET} />
    </div>
  );
}
