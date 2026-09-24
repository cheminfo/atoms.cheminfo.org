/**
 * Every address this site answers, each with the name and the sentence it is
 * indexed under.
 *
 * One table, read by four things that must agree on it: the router, which turns
 * an address into a page; the build, which writes one real HTML file per entry
 * plus the sitemap listing them; the `noscript` crawl path; and the running
 * app, which retitles the tab after an in-app move. Pure data, so the vite
 * config can import it.
 */

import type { RouteMeta } from 'react-cheminfo/core';

/** The site, as the header, the prerender and the share dialog name it. */
export const SITE_ID = 'atoms';

/** What the site is called in prose, spelled as the address it is. */
export const SITE_NAME = 'atoms.cheminfo.org';

/** Where the site is served, and what every canonical address is built on. */
export const SITE_URL = 'https://atoms.cheminfo.org';

/** Where the sources live. */
export const REPOSITORY = 'https://github.com/cheminfo/atoms.cheminfo.org';

/** The pages, named as the router and the state name them. */
export type TabId =
  | 'electrons'
  | 'neutrons'
  | 'isotopes'
  | 'lewis'
  | 'oxidation'
  | 'cheatsheet'
  | 'about';

/** A tool page, as opposed to the cheatsheet and the About. */
export type ToolTab = Exclude<TabId, 'cheatsheet' | 'about'>;

/** A routed page: what a crawler is told about it, and what the bar writes. */
export interface RouteDefinition extends RouteMeta {
  /** The page this address opens. */
  tab: TabId;
  /** How the page is named in the header bar. */
  label: string;
}

/**
 * The pages, in the order the bar lists them. The first is the home page, and
 * is what an address the site does not know opens.
 */
const ROUTE_TABLE = [
  {
    path: '/',
    tab: 'electrons',
    label: 'Electrons',
    title: 'Count the electrons of a molecule or an ion',
    short: 'Electrons',
    note: 'from the atomic numbers and the charge',
    description:
      'Count the electrons of any formula, charge included: the atomic numbers added atom by atom, the charge applied, and a graded series of questions.',
  },
  {
    path: '/neutrons',
    tab: 'neutrons',
    label: 'Neutrons',
    title: 'Count the neutrons of an isotopic formula',
    short: 'Neutrons',
    note: 'mass number minus atomic number',
    description:
      'Count the neutrons of a formula whose atoms name their isotope, such as ²³⁸U¹⁹F₆: A − Z for every atom, added up, with graded questions.',
  },
  {
    path: '/isotopes',
    tab: 'isotopes',
    label: 'Isotopes',
    title: 'Isotopic abundance from the atomic mass',
    short: 'Isotopes',
    note: 'two isotopes, one equation',
    description:
      'Work out the natural abundance of the two stable isotopes of chlorine, copper or bromine from their masses and the atomic mass of the element.',
  },
  {
    path: '/lewis',
    tab: 'lewis',
    label: 'Lewis',
    title: 'Draw Lewis structures, checked atom by atom',
    short: 'Lewis',
    note: 'bonds, lone pairs and formal charges',
    description:
      'Draw the Lewis structure of an acid in a structure editor and see, atom by atom, its bonds, lone pairs, formal charge and the electrons around it.',
  },
  {
    path: '/oxidation',
    tab: 'oxidation',
    label: 'Oxidation',
    title: 'Assign oxidation states with the sum rule',
    short: 'Oxidation',
    note: 'every element of a compound',
    description:
      'Give every element of a compound or an ion its oxidation state, and check the answer with the sum rule: the states times the atom counts give the charge.',
  },
  {
    path: '/cheatsheet',
    tab: 'cheatsheet',
    label: 'Cheatsheet',
    title: 'Atoms, isotopes, Lewis and oxidation rules',
    short: 'Cheatsheet',
    note: 'the rules on one printable page',
    description:
      'The rules these tools apply on one printable page: counting electrons and neutrons, isotopic abundance, octets and formal charges, oxidation states.',
  },
  {
    path: '/about',
    tab: 'about',
    label: 'About',
    title: 'About',
    short: 'About',
    note: 'what it is built on, and how to cite it',
    description:
      'What atoms.cheminfo.org is, who provides it, where its element and isotope data come from, what it is built on, and how to cite it.',
  },
] as const satisfies readonly RouteDefinition[];

/** Every address the site answers. */
export const ROUTES: readonly RouteDefinition[] = ROUTE_TABLE;

/** The tools, in the order the bar lists them. */
export const TOOL_TABS: readonly ToolTab[] = [
  'electrons',
  'neutrons',
  'isotopes',
  'lewis',
  'oxidation',
];

/** The page an address the site does not know opens. */
export const HOME_TAB: TabId = 'electrons';

/**
 * The route of a tab.
 * @param tab - The tab being asked about.
 * @returns Its route, which is the home page for a tab the table does not name.
 */
export function routeForTab(tab: TabId): RouteDefinition {
  for (const route of ROUTES) {
    if (route.tab === tab) return route;
  }
  return ROUTE_TABLE[0];
}

/**
 * Whether a tab is one of the tools.
 * @param tab - The tab being asked about.
 * @returns True for the five tools.
 */
export function isToolTab(tab: TabId): tab is ToolTab {
  return (TOOL_TABS as readonly string[]).includes(tab);
}
