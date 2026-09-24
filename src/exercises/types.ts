import type {
  ExerciseLevel,
  TestCaseResult,
  ValidationResult,
} from 'react-cheminfo/core';

/** What a student has typed into a question, field by field. */
export type Answers = Readonly<Record<string, string>>;

/** One box a question asks the student to fill. */
export interface AnswerField {
  /** Key of the value in {@link Answers}. */
  key: string;
  /** What the box is for, e.g. `Electrons` or `³⁵Cl (%)`. */
  label: string;
  /**
   * Placeholder written in the empty box.
   * @default undefined
   */
  placeholder?: string;
  /**
   * The keyboard a phone opens for the box: digits for a number, letters for
   * a name or a formula.
   * @default 'decimal'
   */
  inputMode?: 'decimal' | 'text';
}

/** The verdict on one field of an answer. */
export interface FieldCase extends TestCaseResult {
  /** The field the verdict is about, as the box labels it. */
  label: string;
}

/** The verdict on a whole answer. */
export type AnswerCheck = ValidationResult<FieldCase>;

/**
 * One tool's exercises: the pool a series is drawn from, what a question asks
 * for, and how an answer is graded, hinted at and solved. Pure: nothing here
 * renders, so every part is unit-tested.
 */
export interface SeriesTool<Question> {
  /** Where the tool's progress and seed are kept. */
  id: string;
  /** Every question a series can draw. */
  pool: readonly Question[];
  /** A stable key for a question, unique in the pool. */
  key: (question: Question) => string;
  /**
   * The level a question is tagged with.
   * @default undefined
   */
  level?: (question: Question) => ExerciseLevel;
  /** The boxes the question asks the student to fill. */
  fields: (question: Question) => AnswerField[];
  /** Grade an answer, one case per field, each reason written as a tutor says it. */
  grade: (question: Question, answers: Answers) => AnswerCheck;
  /** Two to four hints, vague to nearly the answer. */
  hints: (question: Question) => string[];
  /** The worked answer, always revealable. */
  solution: (question: Question) => string;
}
