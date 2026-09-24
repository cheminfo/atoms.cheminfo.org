/**
 * The configuration the link the page was opened with carries: framed or not,
 * and which parts it switches off. Read once; the router keeps both across
 * every move inside the site.
 */

import { signal } from '@preact/signals-react';
import type { ShareConfig } from 'react-cheminfo/core';
import { parseShareConfig } from 'react-cheminfo/core';

import { SHARE_VOCABULARY } from './shareConfig.ts';

/** Ephemeral, cross-component view state. */
export const view = {
  share: signal<ShareConfig>(
    parseShareConfig(globalThis.location?.search ?? '', SHARE_VOCABULARY),
  ),
};
