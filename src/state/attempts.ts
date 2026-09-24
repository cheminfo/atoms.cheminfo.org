/**
 * How far a student has got, kept in this browser.
 *
 * Best effort and never a precondition: a framed page whose storage is
 * partitioned still works, it just forgets. An attempt is keyed by tool, series
 * and question, so a new series starts clean and a shared link reopens its own.
 */

import { signal } from '@preact/signals-react';
import type { ExerciseStatus, ProgressRecords } from 'react-cheminfo/core';
import { localStorageProgressStore, persistBucket } from 'react-cheminfo/core';

/** One question as the student left it. */
export interface Attempt {
  status: ExerciseStatus;
  /** What was typed, or drawn, field by field. */
  answers: Record<string, string>;
  /** The answers as they were when last checked, so a change hides the verdict. */
  checked: string | null;
  hintsRevealed: number;
  showSolution: boolean;
}

/**
 * What a question looks like before anything is typed into it.
 * @returns A fresh attempt.
 */
export function emptyAttempt(): Attempt {
  return {
    status: 'idle',
    answers: {},
    checked: null,
    hintsRevealed: 0,
    showSolution: false,
  };
}

const store = localStorageProgressStore<Attempt>({
  key: 'atoms:attempts',
  version: 1,
  defaults: emptyAttempt(),
});

const seeds = persistBucket<Record<string, number>>({
  key: 'atoms:seeds',
  version: 1,
  defaults: {},
});

/** Every attempt this browser remembers. */
export const attempts = signal<ProgressRecords<Attempt>>(readStore());

/**
 * The key an attempt is kept under.
 * @param tool - The tool.
 * @param seed - The series.
 * @param question - The question's key in the tool's pool.
 * @returns `tool/seed/question`.
 */
export function attemptKey(
  tool: string,
  seed: number,
  question: string,
): string {
  return `${tool}/${seed}/${question}`;
}

/**
 * One question's attempt.
 * @param key - Its key.
 * @returns The attempt, or a fresh one.
 */
export function attemptFor(key: string): Attempt {
  return attempts.value[key] ?? emptyAttempt();
}

/**
 * Change one attempt and keep it.
 * @param key - Its key.
 * @param change - The fields to change.
 */
export function updateAttempt(key: string, change: Partial<Attempt>): void {
  const next = { ...attempts.value, [key]: { ...attemptFor(key), ...change } };
  attempts.value = next;
  void store.save(next);
}

/**
 * Forget the attempts of some questions.
 * @param keys - Their keys.
 */
export function clearAttempts(keys: readonly string[]): void {
  const cleared = new Set(keys);
  const next: ProgressRecords<Attempt> = {};
  for (const [key, attempt] of Object.entries(attempts.value)) {
    if (!cleared.has(key)) next[key] = attempt;
  }
  attempts.value = next;
  void store.save(next);
}

/**
 * Forget every series of a tool but one, so storage does not grow with every
 * new series drawn.
 * @param tool - The tool.
 * @param seed - The series to keep.
 */
export function forgetOtherSeries(tool: string, seed: number): void {
  const keep = `${tool}/${seed}/`;
  const next: ProgressRecords<Attempt> = {};
  for (const [key, attempt] of Object.entries(attempts.value)) {
    if (!key.startsWith(`${tool}/`) || key.startsWith(keep)) {
      next[key] = attempt;
    }
  }
  attempts.value = next;
  void store.save(next);
}

/**
 * The series a tool was last on in this browser.
 * @param tool - The tool.
 * @returns Its seed, or null when it has none yet.
 */
export function storedSeed(tool: string): number | null {
  return seeds.read().value[tool] ?? null;
}

/**
 * Remember the series a tool is on.
 * @param tool - The tool.
 * @param seed - The series.
 */
export function storeSeed(tool: string, seed: number): void {
  seeds.write({ ...seeds.read().value, [tool]: seed });
}

function readStore(): ProgressRecords<Attempt> {
  // The browser binding answers synchronously; a networked one would not.
  const loaded = store.load();
  return loaded instanceof Promise ? {} : loaded;
}
