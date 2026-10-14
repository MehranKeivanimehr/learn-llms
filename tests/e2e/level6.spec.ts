import { expect, test } from '@playwright/test';
import { canvas, clickUntilSolved, expectSolved, openLevel, type } from './helpers';

const SLUG = '06-word-order';

test('level 6: solved by typing', async ({ page }) => {
  await openLevel(page, SLUG);
  await type(page, 'positions on');
  await type(page, 'strength 3');
  await expectSolved(page);
});

test('level 6: solved by clicking', async ({ page }) => {
  await openLevel(page, SLUG);
  await canvas(page).getByRole('button', { name: /Position signals/ }).click();
  await clickUntilSolved(page, canvas(page).getByRole('button', { name: 'Increase Position strength' }), 4);
});

test('level 6: both sentences are drawn with attention arcs', async ({ page }) => {
  await openLevel(page, SLUG);
  await expect(canvas(page).locator('.arc-svg')).toHaveCount(2);
});
