import type { ReactElement, ReactNode } from 'react';
import { GlossaryText, PagePart } from 'react-cheminfo/ui';

interface ToolPageProps {
  title: string;
  /** One or two sentences under the title; may carry `[[term]]` markers. */
  lead: string;
  /**
   * The calculator: anything typed into it is worked out.
   * @default undefined — the page is its graded series alone
   */
  playground?: ReactNode;
  /** The graded series. */
  exercises: ReactNode;
}

/**
 * The layout every tool shares: its title and lead, the calculator when it has
 * one, then the graded series. A link can switch either half off.
 * @param props - The title, the lead and the two halves.
 * @returns The page.
 */
export function ToolPage(props: ToolPageProps): ReactElement {
  const { title, lead, playground, exercises } = props;
  return (
    <div className="tool-page">
      <header className="page-head">
        <h1 className="page__title">{title}</h1>
        <p className="page__lead">
          <GlossaryText text={lead} />
        </p>
      </header>
      {playground === undefined ? null : (
        <PagePart part="playground">
          <section className="panel" aria-labelledby="calculator-heading">
            <h2 className="panel__title" id="calculator-heading">
              Calculator
            </h2>
            {playground}
          </section>
        </PagePart>
      )}
      <PagePart part="exercises">
        <section className="panel" aria-labelledby="questions-heading">
          {exercises}
        </section>
      </PagePart>
    </div>
  );
}
