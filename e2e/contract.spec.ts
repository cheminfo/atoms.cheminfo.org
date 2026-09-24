import { expect, test } from '@playwright/test';

const ROUTES = [
  '/',
  '/neutrons',
  '/isotopes',
  '/lewis',
  '/oxidation',
  '/cheatsheet',
  '/about',
];

for (const route of ROUTES) {
  test(`${route}: the footer starts below the fold`, async ({ page }) => {
    await page.goto(route);
    const footer = page.locator('footer').last();
    await expect(footer).toBeAttached();
    const top = await footer.evaluate(
      (element) => element.getBoundingClientRect().top,
    );
    const height = await page.evaluate(() => window.innerHeight);
    expect(top).toBeGreaterThanOrEqual(height);
  });
}

test('/about says what the site is, who provides it and how to cite it', async ({
  page,
}) => {
  await page.goto('/about');
  await expect(
    page.getByText(
      'Count the electrons and neutrons of a formula, work out isotopic abundances, draw Lewis structures and assign oxidation states.',
    ),
  ).toBeVisible();
  await expect(
    page.getByText('Provided by', { exact: false }).first(),
  ).toBeVisible();
  await expect(page).toHaveTitle('About — atoms.cheminfo.org');
});

test('?embed drops the chrome and keeps the tool', async ({ page }) => {
  await page.goto('/?embed&seed=42');
  await expect(page.locator('header.app-header')).toHaveCount(0);
  await expect(page.locator('footer')).toHaveCount(0);
  await expect(page.getByText('Question 1 of 10')).toBeVisible();
});

test('?hide= switches a part off, and survives a move', async ({ page }) => {
  await page.goto('/?hide=playground,solutions&seed=42');
  await expect(page.getByRole('heading', { name: 'Calculator' })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole('button', { name: 'Reveal solution' }),
  ).toHaveCount(0);
  await page.getByRole('link', { name: 'Neutrons', exact: true }).click();
  await expect(page).toHaveURL(/hide=playground/);
  await expect(page.getByRole('heading', { name: 'Calculator' })).toHaveCount(
    0,
  );
});

test('the share dialog offers the link and the iframe', async ({ page }) => {
  await page.goto('/?seed=42');
  await page.getByRole('button', { name: 'Share' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Show on the page')).toBeVisible();
  await expect(dialog.getByText(/<iframe/)).toBeVisible();
});
