import { expect, test } from '@playwright/test';

import { countElectrons } from '../src/chemistry/particles.ts';
import { ELECTRON_FORMULAS } from '../src/data/electrons.ts';
import { OXIDATION_COMPOUNDS } from '../src/data/oxidation.ts';
import { pickSeeded } from '../src/exercises/seed.ts';

const SEED = 42;
const [FIRST, SECOND] = pickSeeded(ELECTRON_FORMULAS, 10, SEED);

test('a series is the seed in the address: one link, one series', async ({
  page,
}) => {
  await page.goto(`/?seed=${SEED}`);
  const list = page.getByRole('navigation', {
    name: 'Questions of the series',
  });
  await expect(list.getByRole('button')).toHaveCount(10);
  await expect(page.getByText('Question 1 of 10')).toBeVisible();
  expect(FIRST).toBe('Cl2O');
  expect(SECOND).toBe('O2(1-)');
});

test('a wrong answer is named, a right one solves the question', async ({
  page,
}) => {
  await page.goto(`/?seed=${SEED}`);
  const box = page.getByLabel('Electrons', { exact: true });
  const check = page.getByRole('button', { name: 'Check' });

  await box.fill('41');
  await check.click();
  await expect(
    page.getByText(
      '41 is not it. Add the atomic numbers again, one atom at a time.',
    ),
  ).toBeVisible();

  await box.fill(String(countElectrons(FIRST ?? '').electrons));
  await box.press('Enter');
  await expect(page.getByText('Right: Cl₂O holds 42 electrons.')).toBeVisible();
  await expect(page.getByText('1 / 10 solved')).toBeVisible();

  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.getByText('Question 2 of 10')).toBeVisible();
});

test('the hints open one at a time, the solution on demand', async ({
  page,
}) => {
  await page.goto(`/?seed=${SEED}`);
  await page.getByRole('button', { name: /Reveal hint/ }).click();
  await expect(
    page.getByText('In Cl₂O, Cl has Z = 17, O has Z = 8.'),
  ).toBeHidden();
  await page.getByRole('button', { name: /Reveal hint/ }).click();
  await expect(
    page.getByText('In Cl₂O, Cl has Z = 17, O has Z = 8.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Reveal solution' }).click();
  await expect(page.getByText(/Protons: 42; neutral/)).toBeVisible();
});

test('the arrow keys move through the series', async ({ page }) => {
  await page.goto(`/?seed=${SEED}`);
  await page.keyboard.press('ArrowDown');
  await expect(page.getByText('Question 2 of 10')).toBeVisible();
});

test('the series length is a preference the address carries', async ({
  page,
}) => {
  await page.goto(`/?seed=${SEED}&count=5`);
  const list = page.getByRole('navigation', {
    name: 'Questions of the series',
  });
  await expect(list.getByRole('button')).toHaveCount(5);
  await page
    .getByRole('combobox', { name: 'Questions in a series' })
    .selectOption('15');
  await expect(list.getByRole('button')).toHaveCount(15);
  await expect(page).toHaveURL(/count=15/);
});

test('a new series changes the link', async ({ page }) => {
  await page.goto(`/?seed=${SEED}`);
  await page.getByRole('button', { name: 'New series' }).click();
  await expect(page).not.toHaveURL(new RegExp(`seed=${SEED}$`));
  await expect(page).toHaveURL(/\?seed=\d+/);
});

test('an oxidation question grades each element on its own', async ({
  page,
}) => {
  const [compound] = pickSeeded(OXIDATION_COMPOUNDS, 10, 1);
  if (compound === undefined) throw new Error('the pool is empty');
  const symbols = Object.keys(compound.oxidation);
  await page.goto('/oxidation?seed=1');
  const card = page.getByRole('article');
  for (const symbol of symbols) {
    await card
      .getByLabel(symbol, { exact: true })
      .fill(String(compound.oxidation[symbol]));
  }
  const [first] = symbols;
  await card.getByLabel(first ?? '', { exact: true }).fill('9');
  await card.getByRole('button', { name: 'Check' }).click();
  await expect(card.getByRole('listitem')).toHaveCount(symbols.length);
  await expect(card.getByRole('listitem').first()).toContainText('Not +9');
  await expect(card.getByRole('listitem').last()).toContainText('is right.');
});

test('the calculator works out any formula typed into it', async ({ page }) => {
  await page.goto('/');
  const formula = page.getByLabel('Formula');
  await formula.fill('SO4(2-)');
  await expect(page.locator('.calculator__total td')).toHaveText('50');
  await formula.fill('Hx');
  await expect(page.getByText('“Hx” is not an element symbol.')).toBeVisible();
});

test('the Lewis reader reads the shell of every atom', async ({ page }) => {
  await page.goto('/lewis');
  const sulfur = page.getByRole('row').filter({ hasText: 'S1' });
  await expect(sulfur).toContainText('12');
  await expect(sulfur).toContainText('expanded');
});

test('a computed value is copied by clicking it', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByLabel('Formula').fill('SO4(2-)');
  await page.locator('.calculator__total td').click();
  await expect
    .poll(async () => page.evaluate(() => navigator.clipboard.readText()))
    .toBe('50');
});
