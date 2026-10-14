import { expect, test } from '@playwright/test';

test('Play starts at level 1; Continue jumps to the first unsolved level', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /^Play/ })).toHaveAttribute('href', '/inside/01-next-token/');
  await page.evaluate(() =>
    localStorage.setItem('learnllms.progress', JSON.stringify({ version: 1, levels: { 'inside-1': { solved: true, bestMoves: 2 } } })),
  );
  await page.reload();
  await expect(page.getByRole('link', { name: /^Continue/ })).toHaveAttribute('href', '/inside/02-tokens/');
});

test('the home page has an animated splash', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.splash .floater')).toHaveCount(12);
});
