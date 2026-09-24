/**
 * What one link to this site can say beyond the page and the series it opens.
 *
 * `?embed` drops the chrome so a tool can be framed in a course page; `?hide=`
 * switches parts off by name. This module is the only place that knows those
 * names: a component asks through `<PagePart>` and never reads the address.
 */

import type { SharePreset, ShareVocabulary } from 'react-cheminfo/core';

/**
 * The parts an embedder can switch off. Each is named positively — the dialog
 * shows a ticked box for a part that stays — and its description says what
 * switching it off does, for the person building the link.
 */
export const SHARE_VOCABULARY = {
  parts: [
    {
      key: 'tabs',
      label: 'The other tools',
      description:
        'Hiding it removes the bar listing the other tools, so the link stays on this one.',
      inHeader: true,
    },
    {
      key: 'playground',
      label: 'Calculator',
      description:
        'Hiding it removes the box that works out any formula typed into it, leaving the questions alone.',
    },
    {
      key: 'exercises',
      label: 'Questions',
      description:
        'Hiding it removes the graded series, leaving the calculator alone.',
    },
    {
      key: 'solutions',
      label: 'Solutions',
      description:
        'Hiding it removes the Reveal solution button; the hints stay.',
    },
  ],
} as const satisfies ShareVocabulary;

/** The parts a link can switch off, as `?hide=` names them. */
export type HideKey = (typeof SHARE_VOCABULARY)['parts'][number]['key'];

/** The two ways a tool is usually framed in a course page. */
export const SHARE_PRESETS: readonly SharePreset[] = [
  {
    key: 'questions',
    label: 'Questions',
    description:
      'The graded series alone, framed: the one the link names, for every student who opens it.',
    hidden: ['playground'],
  },
  {
    key: 'calculator',
    label: 'Calculator',
    description:
      'The calculator alone, framed: any formula typed in is worked out step by step.',
    hidden: ['exercises'],
  },
];
