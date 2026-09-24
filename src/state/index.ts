/**
 * The application state, in one object read with `useSignals()`: what the
 * visitor is looking at, and what they prefer.
 */

import { preferences } from './preferences.ts';
import { view } from './view.ts';

/** The application state: buckets of signal leaves, never a store. */
export const state = { view, preferences };
