import { expect, test } from '@playwright/test';
import { canvas, clickUntilSolved, expectSolved, openLevel, type } from './helpers';

const SLUG = '04-sampling';

test('level 4: solved by typing', async ({ page }) => {
  await openLevel(page, SLUG);
  await type(page, 'set top-k 1');
  await type(page, 'set top-k 3');
  await expectSolved(page);
});

test('level 4: solved by clicking the + button', async ({ page }) => {
  await openLevel(page, SLUG);
  await clickUntilSolved(page, canvas(page).getByRole('button', { name: 'Increase Top-k' }), 3);
});

test('level 4: sampling drops tokens onto the canvas', async ({ page }) => {
  await openLevel(page, SLUG);
  await canvas(page).getByRole('button', { name: 'Sample 10 tokens' }).click();
  await expect(canvas(page).locator('.drop-in')).toHaveCount(10);
  await expect(canvas(page).locator('.cbars li')).toHaveCount(7);
});
