import { expect, test } from '@playwright/test';
import { canvas, expectSolved, openLevel, type } from './helpers';

const SLUG = '03-embeddings';

test('level 3: solved by typing', async ({ page }) => {
  await openLevel(page, SLUG);
  await type(page, 'move queen 4 3');
  await expectSolved(page);
});

test('level 3: solved by tapping the word and a grid point', async ({ page }) => {
  await openLevel(page, SLUG);
  await canvas(page).getByRole('button', { name: /queen at/ }).click();
  await canvas(page).getByRole('button', { name: 'Move queen to (4, 3)' }).click();
  await expectSolved(page);
});

test('level 3: the canvas ranks the closest words', async ({ page }) => {
  await openLevel(page, SLUG);
  await expect(canvas(page).getByText('Closest to king − man + woman')).toBeVisible();
});
