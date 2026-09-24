import { Button, Callout, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import type { ReactElement, ReactNode } from 'react';
import { useMemo } from 'react';
import {
  ExerciseActions,
  GlossaryText,
  HintLadder,
  LEVEL_INTENT,
  TestCaseList,
  useIsHidden,
} from 'react-cheminfo/ui';

import type { Answers, FieldCase, SeriesTool } from '../exercises/types.ts';
import { attemptFor, emptyAttempt, updateAttempt } from '../state/attempts.ts';

import { AnswerFields } from './AnswerFields.tsx';

/** What a tool's own answer input is handed. */
export interface AnswerInputProps<Question> {
  question: Question;
  answers: Answers;
  onChange: (key: string, value: string) => void;
  onSubmit: () => void;
}

/** How one tool draws the parts of a question the card does not know. */
export interface QuestionRendering<Question> {
  /** The statement of the question. */
  prompt: (question: Question) => ReactNode;
  /**
   * An input of the tool's own, in place of the typed boxes.
   * @default undefined
   */
  answer?: (props: AnswerInputProps<Question>) => ReactNode;
  /**
   * What the solution shows beyond its text, such as a drawn structure.
   * @default undefined
   */
  solution?: (question: Question) => ReactNode;
}

interface QuestionCardProps<Question> extends QuestionRendering<Question> {
  tool: SeriesTool<Question>;
  question: Question;
  /** Where the attempt is kept. */
  storageKey: string;
  number: number;
  total: number;
  /**
   * Open the next question; absent on the last one.
   * @default undefined
   */
  onNext?: () => void;
}

/**
 * One question: its statement, the answer, the four actions, and — once
 * checked — the verdict case by case, the hints taken and the solution.
 *
 * The answer is graded on every change, but the verdict is shown only for the
 * answer as it was checked: a numeric answer that turned green as it was typed
 * could be found by trying numbers.
 * @param props - The tool, the question and how to draw it.
 * @returns The card.
 */
export function QuestionCard<Question>(
  props: QuestionCardProps<Question>,
): ReactElement {
  useSignals();
  const {
    tool,
    question,
    storageKey,
    number,
    total,
    onNext,
    prompt,
    answer,
    solution,
  } = props;
  const isHidden = useIsHidden();
  const {
    answers,
    checked: checkedAnswers,
    hintsRevealed,
    showSolution,
  } = attemptFor(storageKey);
  const check = useMemo(
    () => tool.grade(question, answers),
    [tool, question, answers],
  );
  const hints = useMemo(() => tool.hints(question), [tool, question]);
  const snapshot = JSON.stringify(answers);
  const checked = checkedAnswers === snapshot;
  const solutionsHidden = isHidden('solutions');
  const level = tool.level?.(question);

  function setAnswer(key: string, value: string): void {
    updateAttempt(storageKey, { answers: { ...answers, [key]: value } });
  }

  function commit(): void {
    updateAttempt(storageKey, {
      status: check.passed ? 'solved' : 'attempted',
      checked: snapshot,
    });
  }

  return (
    <article className="question-card" aria-label={`Question ${number}`}>
      <div className="question-card__meta">
        <span>
          Question {number} of {total}
        </span>
        {level === undefined ? null : (
          <Tag minimal intent={LEVEL_INTENT[level]}>
            {level}
          </Tag>
        )}
      </div>
      <div className="question-card__prompt">{prompt(question)}</div>

      {answer ? (
        answer({ question, answers, onChange: setAnswer, onSubmit: commit })
      ) : (
        <AnswerFields
          fields={tool.fields(question)}
          answers={answers}
          onChange={setAnswer}
          onSubmit={commit}
        />
      )}

      <ExerciseActions
        onCheck={commit}
        checkDisabled={isBlank(answers)}
        onRevealHint={() => {
          updateAttempt(storageKey, {
            hintsRevealed: Math.min(hintsRevealed + 1, hints.length),
          });
        }}
        hintsRevealed={hintsRevealed}
        hintCount={hints.length}
        onToggleSolution={
          solutionsHidden
            ? undefined
            : () => {
                updateAttempt(storageKey, {
                  showSolution: !showSolution,
                });
              }
        }
        showSolution={showSolution}
        onReset={() => {
          updateAttempt(storageKey, emptyAttempt());
        }}
      />

      {checked ? (
        <TestCaseList<FieldCase>
          results={check.cases}
          label={(verdict) => verdict.label}
        />
      ) : null}

      {checked && check.passed ? (
        <Callout intent="success" icon="tick-circle" title="Solved">
          {hintsRevealed > 0
            ? `With ${hintsRevealed} of ${hints.length} hints.`
            : 'Without a hint.'}
          {onNext ? (
            <Button
              className="question-card__next"
              intent="success"
              endIcon="arrow-right"
              text="Next question"
              onClick={onNext}
            />
          ) : null}
        </Callout>
      ) : null}

      {hintsRevealed > 0 ? (
        <HintLadder hints={hints} revealed={hintsRevealed} />
      ) : null}

      {showSolution && !solutionsHidden ? (
        <Callout intent="warning" icon="key" title="Solution">
          <p className="question-card__solution">
            <GlossaryText text={tool.solution(question)} />
          </p>
          {solution?.(question)}
        </Callout>
      ) : null}
    </article>
  );
}

function isBlank(answers: Answers): boolean {
  for (const value of Object.values(answers)) {
    if (value.trim() !== '') return false;
  }
  return true;
}
