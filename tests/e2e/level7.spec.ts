import { expect, test } from '@playwright/test';
import { canvas, expectSolved, openLevel, type } from './helpers';

const SLUG = '07-transformer-block';

test('level 7: solved by typing', async ({ page }) => {
  await openLevel(page, SLUG);
  for (const line of ['place attention 1', 'place norm 2', 'place mlp 3', 'place norm 4']) await type(page, line);
  await expectSolved(page);
});

test('level 7: solved by tapping pieces then steps', async ({ page }) => {
  await openLevel(page, SLUG);
  const order = ['Self-attention', 'Add & Norm', 'MLP', 'Add & Norm'];
  for (let i = 0; i < order.length; i++) {
    await canvas(page).locator('.tray').getByRole('button', { name: order[i] }).first().click();
    await canvas(page).getByRole('button', { name: new RegExp(`^Step ${i + 1}:`) }).click();
  }
  await expectSolved(page);
});

test('level 7: the output card appears once the block is full', async ({ page }) => {
  await openLevel(page, SLUG);
  await expect(canvas(page).getByText('Fill all four steps to run the block.')).toBeVisible();
  await expect(canvas(page).locator('.scene-card')).toHaveCount(1);
});
