import { Tag } from '@blueprintjs/core';
import { Molecule } from 'openchemlib';
import type { ReactElement } from 'react';
import { useState } from 'react';
import type { StructureEditorChange } from 'react-cheminfo/structure';
import { Structure, StructureEditor } from 'react-cheminfo/structure';

import type { LewisAtom, LewisTarget } from '../chemistry/lewis.ts';
import { readLewisAtoms } from '../chemistry/lewis.ts';
import { compoundName } from '../data/names.ts';
import { formatSigned } from '../exercises/answers.ts';
import { CalculatorTable } from '../shared/CalculatorTable.tsx';
import { ExerciseSeries } from '../shared/ExerciseSeries.tsx';
import { QuestionCompound } from '../shared/QuestionCompound.tsx';
import { QuestionFormula } from '../shared/QuestionFormula.tsx';
import { ToolPage } from '../shared/ToolPage.tsx';
import { LEWIS_TOOL, STRUCTURE_FIELD } from '../tools/lewis.ts';

/** What the playground opens on: sulfuric acid, drawn with its expanded octet. */
const START = Molecule.fromSmiles('O=S(=O)(O)O').getIDCode();

/**
 * Draw the Lewis structure of a formula, and read the electrons around each
 * atom of any drawing.
 * @returns The page.
 */
export function Lewis(): ReactElement {
  return (
    <ToolPage
      title="Lewis structures"
      lead="A Lewis structure places every [[valence electrons|valence electron]] of a molecule in a bond or a [[lone pair]], so that each atom reaches a full shell. Draw one and read it atom by atom."
      playground={<LewisReader />}
      exercises={
        <ExerciseSeries
          tab="lewis"
          tool={LEWIS_TOOL}
          label={(target) => <QuestionFormula formula={target.formula} />}
          prompt={(target) => (
            <>
              <QuestionCompound
                formula={target.formula}
                name={compoundName('lewis', target.formula)}
              />
              <p>Draw its Lewis structure.</p>
            </>
          )}
          answer={({ answers, onChange }) => (
            <StructureEditor
              value={answers[STRUCTURE_FIELD] ?? ''}
              minHeight={300}
              onChange={(change) => {
                onChange(STRUCTURE_FIELD, change.idCode);
              }}
            />
          )}
          solution={(target) => <AcceptedDrawings target={target} />}
        />
      }
    />
  );
}

function LewisReader(): ReactElement {
  const [atoms, setAtoms] = useState<LewisAtom[]>(() =>
    readLewisAtoms(Molecule.fromIDCode(START)),
  );

  function read(change: StructureEditorChange): void {
    if (change.mode !== 'molecule') return;
    setAtoms(readLewisAtoms(change.molecule));
  }

  return (
    <div className="calculator calculator--wide">
      <StructureEditor value={START} minHeight={300} onChange={read} />
      {atoms.length === 0 ? (
        <p className="page__lead">Draw a structure to read its atoms.</p>
      ) : (
        <CalculatorTable
          headers={[
            'Atom',
            'Bonds',
            'Lone pairs',
            'Formal charge',
            'Electrons around it',
            'Shell',
          ]}
        >
          {atoms.map((atom) => (
            <tr key={atom.index}>
              <td>
                {atom.symbol}
                <sub>{atom.index + 1}</sub>
              </td>
              <td>{atom.bonds}</td>
              <td>
                {atom.lonePairElectrons === null
                  ? '—'
                  : atom.lonePairElectrons / 2}
              </td>
              <td>{formatSigned(atom.formalCharge)}</td>
              <td>{atom.electrons ?? '—'}</td>
              <td>
                <ShellTag atom={atom} />
              </td>
            </tr>
          ))}
        </CalculatorTable>
      )}
    </div>
  );
}

const SHELL_LABEL: Record<LewisAtom['status'], string> = {
  full: 'full',
  expanded: 'expanded',
  incomplete: 'six, allowed',
  short: 'too few',
  over: 'too many',
  odd: 'odd count',
  negative: 'too many bonds',
  unknown: 'not described',
};

function ShellTag(props: { atom: LewisAtom }): ReactElement {
  const { status } = props.atom;
  const intent =
    status === 'full' || status === 'incomplete'
      ? 'success'
      : status === 'expanded' || status === 'unknown'
        ? 'primary'
        : 'danger';
  return (
    <Tag minimal intent={intent}>
      {SHELL_LABEL[status]}
    </Tag>
  );
}

function AcceptedDrawings(props: { target: LewisTarget }): ReactElement {
  return (
    <div className="accepted-drawings">
      {props.target.accepted.map((smiles) => (
        <Structure key={smiles} smiles={smiles} width={220} height={160} />
      ))}
    </div>
  );
}
