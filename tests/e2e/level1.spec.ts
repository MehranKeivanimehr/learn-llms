import { expect, test } from '@playwright/test';
import { canvas, expectSolved, openLevel, type } from './helpers';

const SLUG = '01-next-token';

test('level 1: solved by typing', async ({ page }) => {
  await openLevel(page, SLUG);
  await type(page, 'remove Germany');
  await type(page, 'add France');
  await expectSolved(page);
});

test('level 1: solved by clicking', async ({ page }) => {
  await openLevel(page, SLUG);
  await canvas(page).getByRole('button', { name: 'Remove Germany' }).click();
  await canvas(page).getByRole('button', { name: 'Add France' }).click();
  await expectSolved(page);
});

test('level 1: predictions are animated bars on the canvas', async ({ page }) => {
  await openLevel(page, SLUG);
  await expect(canvas(page).locator('.cbars li')).toHaveCount(6);
  await expect(canvas(page).locator('.canvas-chip').first()).toBeVisible();
});
