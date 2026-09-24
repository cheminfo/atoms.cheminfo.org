import { assertRoutes } from 'react-cheminfo/core';
import { expect, test } from 'vitest';

import { ROUTES, TOOL_TABS, isToolTab, routeForTab } from '../routes.ts';

test('the table is one the build can write files from', () => {
  expect(() => {
    assertRoutes(ROUTES);
  }).not.toThrow();
});

test('every page carries a title and a description written for search', () => {
  for (const route of ROUTES) {
    expect({ path: route.path, short: route.title.length <= 60 }).toStrictEqual(
      {
        path: route.path,
        short: true,
      },
    );
    expect({
      path: route.path,
      length:
        route.description.length >= 110 && route.description.length <= 160,
    }).toStrictEqual({ path: route.path, length: true });
  }
});

test('the tool comes first, at the root, and every page has its address', () => {
  expect(ROUTES.map((route) => [route.tab, route.path])).toStrictEqual([
    ['electrons', '/'],
    ['neutrons', '/neutrons'],
    ['isotopes', '/isotopes'],
    ['lewis', '/lewis'],
    ['oxidation', '/oxidation'],
    ['cheatsheet', '/cheatsheet'],
    ['about', '/about'],
  ]);
  expect(TOOL_TABS.every((tab) => isToolTab(tab))).toBe(true);
  expect(isToolTab('about')).toBe(false);
  expect(routeForTab('lewis').label).toBe('Lewis');
});
