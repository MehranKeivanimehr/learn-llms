import { expect, test } from '@playwright/test';
import { canvas, clickUntilSolved, expectSolved, openLevel, type } from './helpers';

const SLUG = '08-generation';

test('level 8: solved by typing', async ({ page }) => {
  await openLevel(page, SLUG);
  await type(page, 'prompt "twinkle, twinkle, "');
  await type(page, 'temperature 0');
  await expectSolved(page);
});

test('level 8: solved with the canvas controls', async ({ page }) => {
  await openLevel(page, SLUG);
  await canvas(page).getByLabel('Prompt').fill('twinkle, twinkle, ');
  await canvas(page).getByRole('button', { name: 'Use this prompt' }).click();
  await clickUntilSolved(page, canvas(page).getByRole('button', { name: 'Decrease Temperature' }), 10);
});

test('level 8: the output types itself out', async ({ page }) => {
  await openLevel(page, SLUG);
  await expect(canvas(page).locator('.generation .typed')).toBeVisible();
});
