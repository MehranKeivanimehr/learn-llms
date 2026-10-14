import { expect, test } from '@playwright/test';
import { canvas, clickUntilSolved, expectSolved, openLevel, type } from './helpers';

const SLUG = '05-attention';

test('level 5: solved by typing', async ({ page }) => {
  await openLevel(page, SLUG);
  await type(page, 'query it --x 3 --y -1.5');
  await expectSolved(page);
});

test('level 5: solved by clicking the + button', async ({ page }) => {
  await openLevel(page, SLUG);
  await clickUntilSolved(page, canvas(page).getByRole('button', { name: 'Increase Query x' }), 6);
});

test('level 5: attention is drawn as arcs from "it"', async ({ page }) => {
  await openLevel(page, SLUG);
  await expect(canvas(page).locator('.arc-svg .arc')).toHaveCount(9);
});
