import { expect, test } from '@playwright/test';
import { canvas, expectSolved, openLevel } from './helpers';
import { SLUGS } from './levels';

test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });

test('level 1 can be solved by tapping', async ({ page }) => {
  await openLevel(page, '01-next-token');
  await canvas(page).getByRole('button', { name: 'Remove Germany' }).tap();
  await canvas(page).getByRole('button', { name: 'Add France' }).tap();
  await expectSolved(page);
});

test('level 7 can be solved by tapping pieces then steps', async ({ page }) => {
  await openLevel(page, '07-transformer-block');
  const order = ['Self-attention', 'Add & Norm', 'MLP', 'Add & Norm'];
  for (let i = 0; i < order.length; i++) {
    await canvas(page).locator('.tray').getByRole('button', { name: order[i] }).first().tap();
    await canvas(page).getByRole('button', { name: new RegExp(`^Step ${i + 1}:`) }).tap();
  }
  await expectSolved(page);
});

test('the canvas sits above the terminal on phones', async ({ page }) => {
  await openLevel(page, '05-attention');
  const canvasBox = await canvas(page).boundingBox();
  const terminalBox = await page.getByRole('region', { name: 'Terminal' }).boundingBox();
  expect(canvasBox!.y).toBeLessThan(terminalBox!.y);
});

for (const slug of SLUGS) {
  test(`${slug} has no page-level horizontal scroll at 375px`, async ({ page }) => {
    await openLevel(page, slug);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });
}
