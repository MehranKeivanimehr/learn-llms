import { expect, test } from '@playwright/test';

const LEVEL = '/inside/01-next-token/';

test('the puzzle tab unlocks from the end of Explore and the level can be solved', async ({ page }) => {
  await page.goto(LEVEL);
  await expect(page.getByRole('tab', { name: /Puzzle/ })).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('button', { name: 'Try the puzzle →' }).click();
  await expect(page.getByRole('tab', { name: 'Puzzle' })).toHaveAttribute('aria-selected', 'true');

  const puzzle = page.locator('#panel-puzzle');
  await puzzle.getByRole('button', { name: 'Remove Germany' }).click();
  await puzzle.getByRole('button', { name: 'Add France' }).click();
  await expect(page.getByRole('dialog', { name: /Solved/ })).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('exactly par');
});

test('progress survives a reload and shows on the track map', async ({ page }) => {
  await page.goto(LEVEL);
  await page.getByRole('button', { name: 'Try the puzzle →' }).click();
  const puzzle = page.locator('#panel-puzzle');
  await puzzle.getByRole('button', { name: 'Remove Germany' }).click();
  await puzzle.getByRole('button', { name: 'Add France' }).click();
  await expect(page.getByRole('dialog', { name: /Solved/ })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('tab', { name: 'Puzzle' })).toHaveAttribute('aria-disabled', 'false');
  await page.goto('/inside/');
  await expect(page.locator('[data-level-card="inside-1"]')).toContainText('Solved');
});

test('the code challenge passes with a correct answer', async ({ page }) => {
  await page.goto(LEVEL);
  await page.getByRole('tab', { name: 'Code' }).click();
  await page
    .locator('.cm-content')
    .fill('function argmax(p) { let b = 0; for (let i = 1; i < p.length; i++) if (p[i] > p[b]) b = i; return b; }');
  await page.getByRole('button', { name: 'Run tests' }).click();
  await expect(page.getByText('All tests pass!')).toBeVisible();
});

test('the code challenge stops an infinite loop', async ({ page }) => {
  await page.goto(LEVEL);
  await page.getByRole('tab', { name: 'Code' }).click();
  await page.locator('.cm-content').fill('function argmax(p) { while (true) {} }');
  await page.getByRole('button', { name: 'Run tests' }).click();
  await expect(page.getByText(/took too long/)).toBeVisible({ timeout: 5000 });
});
