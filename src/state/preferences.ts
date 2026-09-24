/**
 * The visitor's preferences: kept in this browser, and mirrored in the address
 * so the link on screen is always the one to hand out.
 */

import { effect, signal } from '@preact/signals-react';
import type { ShareParamCodec, UrlPreferences } from 'react-cheminfo/core';
import {
  formatQueryEntries,
  integerParam,
  parseQueryEntries,
  persistSignalBucket,
  syncPreferencesWithUrl,
} from 'react-cheminfo/core';

/** How many questions a series holds unless the visitor asks for another number. */
export const DEFAULT_QUESTION_COUNT = 10;

/** The series lengths the picker offers. */
export const QUESTION_COUNTS: readonly number[] = [5, 10, 15, 20];

const COUNT_CODEC: ShareParamCodec<number> = integerParam({
  min: 3,
  max: 30,
  default: DEFAULT_QUESTION_COUNT,
});

/** The preferences, as signals, rehydrated from this browser. */
export const preferences = persistSignalBucket({
  key: 'atoms:preferences',
  bucket: {
    /** How many questions a series holds. */
    questionCount: signal(DEFAULT_QUESTION_COUNT),
  },
  effect,
});

/** The preferences a link names, keyed by their parameter in the address. */
export const URL_PREFERENCES: UrlPreferences = {
  count: {
    codec: COUNT_CODEC,
    get: () => preferences.questionCount.value,
    set: (value) => {
      preferences.questionCount.value = value as number;
    },
  },
};

/** The parameters a move inside the site carries over, besides the share ones. */
export const PREFERENCE_KEYS: readonly string[] = Object.keys(URL_PREFERENCES);

/**
 * Apply the preferences the opening address names, then keep the address in
 * step with every change.
 * @returns The function that stops following.
 */
export function startPreferenceSync(): () => void {
  return syncPreferencesWithUrl({
    preferences: URL_PREFERENCES,
    subscribe: (listener) =>
      effect(() => {
        trackPreferences();
        listener();
      }),
  });
}

/**
 * The query string of the page on screen with every preference written out,
 * its default included, for the share dialog: a link only names a preference
 * that differs from the default, and one it does not name leaves the visitor's
 * own stored value in place — so a link a teacher hands out pins them all.
 * @returns The query string, with its `?`.
 */
export function pinnedSearch(): string {
  const entries = parseQueryEntries(globalThis.location?.search ?? '').filter(
    ([key]) => !(key in URL_PREFERENCES),
  );
  for (const [key, preference] of Object.entries(URL_PREFERENCES)) {
    entries.push([key, String(preference.get())]);
  }
  const query = formatQueryEntries(entries);
  return query === '' ? '' : `?${query}`;
}

/**
 * Change the length of a series.
 * @param count - How many questions a series holds.
 */
export function setQuestionCount(count: number): void {
  preferences.questionCount.value = count;
}

// Reading every preference inside an effect is what subscribes it.
function trackPreferences(): number {
  return preferences.questionCount.value;
}
