import { expect, test } from '@playwright/test';
import { canvas, expectSolved, openLevel, type } from './helpers';

const SLUG = '02-tokens';

test('level 2: solved by typing', async ({ page }) => {
  await openLevel(page, SLUG);
  for (const line of ['merge l o', 'merge lo w', 'merge low e']) await type(page, line);
  await expectSolved(page);
});

test('level 2: solved by clicking', async ({ page }) => {
  await openLevel(page, SLUG);
  for (const name of [/^Merge l and o,/, /^Merge lo and w,/, /^Merge low and e,/]) {
    await canvas(page).getByRole('button', { name }).click();
  }
  await expectSolved(page);
});

test('level 2: the canvas shows a live token count', async ({ page }) => {
  await openLevel(page, SLUG);
  await expect(canvas(page).locator('.big-number')).toContainText('16');
});
