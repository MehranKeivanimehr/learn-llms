import { expect, test } from '@playwright/test';
import { SLUGS } from './levels';

test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });

test('level 1 can be solved by touch', async ({ page }) => {
  await page.goto('/inside/01-next-token/');
  await page.getByRole('button', { name: 'Try the puzzle →' }).tap();
  const puzzle = page.locator('#panel-puzzle');
  await puzzle.getByRole('button', { name: 'Remove Germany' }).tap();
  await puzzle.getByRole('button', { name: 'Add France' }).tap();
  await expect(page.getByRole('dialog', { name: /Solved/ })).toBeVisible();
});

test('level 7 can be solved by tapping pieces then steps', async ({ page }) => {
  await page.goto('/inside/07-transformer-block/');
  await page.getByRole('button', { name: 'Try the puzzle →' }).tap();
  const puzzle = page.locator('#panel-puzzle');
  const order = ['Self-attention', 'Add & Norm', 'MLP', 'Add & Norm'];
  for (let i = 0; i < order.length; i++) {
    await puzzle.locator('.tray').getByRole('button', { name: order[i] }).first().tap();
    await puzzle.getByRole('button', { name: new RegExp(`^Step ${i + 1}:`) }).tap();
  }
  await expect(page.getByRole('dialog', { name: /Solved/ })).toBeVisible();
});

for (const slug of SLUGS) {
  test(`${slug} has no page-level horizontal scroll at 375px`, async ({ page }) => {
    await page.goto(`/inside/${slug}/`);
    const explore = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(explore).toBeLessThanOrEqual(375);
    await page.getByRole('button', { name: 'Try the puzzle →' }).tap();
    const puzzle = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(puzzle).toBeLessThanOrEqual(375);
  });
}
