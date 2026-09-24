/**
 * Routing by path, through the History API.
 *
 * ```
 * /            /neutrons     /isotopes     /lewis
 * /oxidation   /cheatsheet   /about
 * ```
 *
 * A tool page also carries `?seed=`, the series on screen, so the address bar
 * is always the link that reopens the same questions. The string ↔ route
 * mapping is `createTabRouter`; this module only says how the site writes it.
 */

import {
  createTabRouter,
  startDocumentMeta,
  subscribeToRoute,
  writeRoute,
} from 'react-cheminfo/core';

import type { TabId } from '../routes.ts';
import { HOME_TAB, ROUTES, SITE_ID } from '../routes.ts';

import { PREFERENCE_KEYS } from './preferences.ts';
import { ADDRESSES } from './site.ts';

/** The one place that knows how this site's addresses are written. */
export const router = createTabRouter<TabId>({
  tabs: ROUTES.map((route) => ({ id: route.tab, path: route.path })),
  home: HOME_TAB,
  basePath: ADDRESSES.basePath,
});

/**
 * Open a page, keeping the share configuration and the preferences the
 * address carries.
 * @param tab - The page to open.
 */
export function navigate(tab: TabId): void {
  writeRoute(router, { tab }, { keep: PREFERENCE_KEYS });
}

/**
 * Name the series on screen in the address.
 * @param tab - The tool the series belongs to.
 * @param seed - The series.
 * @param history - `push` for a new series the back button can undo,
 * `replace` when the page only states the series it opened on.
 */
export function writeSeed(
  tab: TabId,
  seed: number,
  history: 'push' | 'replace',
): void {
  writeRoute(
    router,
    { tab, params: { seed: String(seed) } },
    { history, keep: PREFERENCE_KEYS },
  );
}

/**
 * Keep the tab title, the description and the canonical link in step with the
 * page on screen.
 * @returns The function that stops following.
 */
export function startDocumentTitles(): () => void {
  return startDocumentMeta({
    site: SITE_ID,
    routes: ROUTES,
    url: () => ADDRESSES.pathWithoutBase(globalThis.location.pathname),
    // Written once for the address the page opened on, then after every move.
    follow: (write) => {
      write();
      return subscribeToRoute(router, () => {
        write();
      });
    },
  });
}
