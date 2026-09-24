import { expect, test } from '@playwright/test';

const PAGES = [
  { path: '/', heading: 'Electrons of a molecule or an ion' },
  { path: '/neutrons', heading: 'Neutrons of an isotopic formula' },
  { path: '/isotopes', heading: 'Isotopic abundance from the atomic mass' },
  { path: '/lewis', heading: 'Lewis structures' },
  { path: '/oxidation', heading: 'Oxidation states and the sum rule' },
  { path: '/cheatsheet', heading: 'The rules on one page' },
];

for (const { path, heading } of PAGES) {
  test(`${path} opens on its tool, with no error in the console`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.goto(path);
    await expect(
      page.getByRole('heading', { level: 1, name: heading, exact: true }),
    ).toBeVisible();
    expect(errors).toStrictEqual([]);
  });
}

test('the bar moves between the tools, and the address follows', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Oxidation', exact: true }).click();
  await expect(page).toHaveURL(/\/oxidation\?seed=\d+$/);
  await expect(page).toHaveTitle(
    'Assign oxidation states with the sum rule — atoms.cheminfo.org',
  );
  await page.goBack();
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Electrons of a molecule or an ion',
    }),
  ).toBeVisible();
});
