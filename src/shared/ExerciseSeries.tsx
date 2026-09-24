import { Button, HTMLSelect } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import type { ReactElement, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { progressSummary } from 'react-cheminfo/core';
import {
  ExerciseProgressHeader,
  ExerciseStatusIcon,
  useDocumentListNavigation,
  useTabRoute,
} from 'react-cheminfo/ui';

import { freshSeed, parseSeed, pickSeeded } from '../exercises/seed.ts';
import type { SeriesTool } from '../exercises/types.ts';
import type { ToolTab } from '../routes.ts';
import {
  attemptKey,
  attempts,
  clearAttempts,
  forgetOtherSeries,
  storeSeed,
  storedSeed,
} from '../state/attempts.ts';
import { state } from '../state/index.ts';
import { QUESTION_COUNTS, setQuestionCount } from '../state/preferences.ts';
import { router, writeSeed } from '../state/router.ts';

import type { QuestionRendering } from './QuestionCard.tsx';
import { QuestionCard } from './QuestionCard.tsx';

interface ExerciseSeriesProps<Question> extends QuestionRendering<Question> {
  tab: ToolTab;
  tool: SeriesTool<Question>;
  /** How a question is named in the list beside the card. */
  label: (question: Question) => ReactNode;
}

/**
 * A graded series drawn from a tool's pool: the list of its questions, the
 * one open, and the progress over the series.
 *
 * The series is its seed, and the seed is in the address, so the link on
 * screen reopens the same questions for anyone — a teacher hands out one
 * series to a whole class.
 * @param props - The tool and how to draw its questions.
 * @returns The series.
 */
export function ExerciseSeries<Question>(
  props: ExerciseSeriesProps<Question>,
): ReactElement {
  useSignals();
  const { tab, tool, label, ...rendering } = props;
  const route = useTabRoute(router);
  const [fallbackSeed] = useState(() => storedSeed(tool.id) ?? freshSeed());
  const addressSeed = parseSeed(route.params.seed);
  const seed = addressSeed ?? fallbackSeed;
  const count = Math.min(
    state.preferences.questionCount.value,
    tool.pool.length,
  );

  useEffect(() => {
    if (addressSeed === null) writeSeed(tab, fallbackSeed, 'replace');
  }, [addressSeed, fallbackSeed, tab]);

  useEffect(() => {
    storeSeed(tool.id, seed);
  }, [tool.id, seed]);

  const series = useMemo(
    () => pickSeeded(tool.pool, count, seed),
    [tool.pool, count, seed],
  );
  const keys = useMemo(
    () =>
      series.map((question) => attemptKey(tool.id, seed, tool.key(question))),
    [series, tool, seed],
  );

  const [opened, setOpened] = useState({ seed, index: 0 });
  const index =
    opened.seed === seed ? Math.min(opened.index, series.length - 1) : 0;
  function open(next: number): void {
    setOpened({ seed, index: next });
  }
  const listRef = useDocumentListNavigation<HTMLElement>({
    length: series.length,
    selectedIndex: index,
    onSelect: open,
  });

  const records = attempts.value;
  const summary = progressSummary(records, keys);
  const question = series[index];
  const storageKey = keys[index];

  function newSeries(): void {
    const next = freshSeed();
    forgetOtherSeries(tool.id, next);
    writeSeed(tab, next, 'push');
  }

  return (
    <div className="series">
      <div className="series__head">
        <h2 className="panel__title" id="questions-heading">
          Questions
        </h2>
        <div className="series__controls">
          <HTMLSelect
            aria-label="Questions in a series"
            value={count}
            onChange={(event) => {
              setQuestionCount(Number(event.currentTarget.value));
            }}
            options={countOptions(tool.pool.length)}
          />
          <Button
            icon="refresh"
            text="New series"
            title="Draw another series; the link on screen changes with it"
            onClick={newSeries}
          />
        </div>
      </div>

      <ExerciseProgressHeader
        summary={summary}
        onClearAll={() => {
          clearAttempts(keys);
        }}
        clearDisabled={!keys.some((key) => records[key] !== undefined)}
      />

      <div className="series__body">
        <nav
          ref={listRef}
          className="series__list"
          aria-label="Questions of the series"
        >
          {series.map((entry, position) => {
            const key = keys[position] ?? '';
            return (
              <Button
                key={key}
                variant="minimal"
                alignText="start"
                fill
                active={position === index}
                data-selected={position === index ? 'true' : undefined}
                icon={
                  <ExerciseStatusIcon status={records[key]?.status ?? 'idle'} />
                }
                onClick={() => {
                  open(position);
                }}
              >
                <span className="series__number">{position + 1}.</span>{' '}
                {label(entry)}
              </Button>
            );
          })}
        </nav>

        {question === undefined || storageKey === undefined ? null : (
          <QuestionCard
            key={storageKey}
            tool={tool}
            question={question}
            storageKey={storageKey}
            number={index + 1}
            total={series.length}
            onNext={
              index + 1 < series.length
                ? () => {
                    open(index + 1);
                  }
                : undefined
            }
            {...rendering}
          />
        )}
      </div>
    </div>
  );
}

/**
 * The series lengths a pool can fill, and the whole pool when it is smaller
 * than the longest of them.
 * @param poolSize - How many questions the pool holds.
 * @returns The options of the picker.
 */
function countOptions(
  poolSize: number,
): Array<{ value: number; label: string }> {
  const options: Array<{ value: number; label: string }> = [];
  for (const count of QUESTION_COUNTS) {
    if (count < poolSize) {
      options.push({ value: count, label: `${count} questions` });
    }
  }
  options.push({ value: poolSize, label: `All ${poolSize} questions` });
  return options;
}
