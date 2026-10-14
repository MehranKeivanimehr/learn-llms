import { expect, test } from '@playwright/test';

test('"Show solution" replays the solution and records the level as solved', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/inside/02-tokens/');
  await page.getByRole('button', { name: 'Try the puzzle →' }).click();
  await page.getByRole('button', { name: 'Show solution' }).click();
  await expect(page.getByRole('dialog', { name: /Solved/ })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('dialog')).toContainText('watched the solution');
  await page.goto('/inside/');
  await expect(page.locator('[data-level-card="inside-2"]')).toContainText('Solved');
});

test('sliders commit a move from the keyboard', async ({ page }) => {
  await page.goto('/inside/04-sampling/');
  await page.getByRole('button', { name: 'Try the puzzle →' }).click();
  const panel = page.locator('#panel-puzzle');
  await panel.getByLabel(/Top-k/).focus();
  await page.keyboard.press('ArrowRight');
  await expect(panel.locator('.checker li').first()).toHaveClass('met');
  await expect(panel.locator('.moves')).toContainText('Moves: 1');
});

test('a slider release that only fires "change" (as on touch screens) still commits a move', async ({ page }) => {
  await page.goto('/inside/05-attention/');
  await page.getByRole('button', { name: 'Try the puzzle →' }).click();
  const panel = page.locator('#panel-puzzle');
  await panel.getByLabel(/Query x/).evaluate((el: HTMLInputElement) => {
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setValue.call(el, '3');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(panel.locator('.moves')).toContainText('Moves: 1');
});

test('a level page loads less than 400 KB of JavaScript up front', async ({ page }) => {
  const sizes: Promise<number>[] = [];
  page.on('response', (r) => {
    if (r.url().endsWith('.js')) sizes.push(r.body().then((b) => b.length).catch(() => 0));
  });
  await page.goto('/inside/01-next-token/');
  await page.waitForLoadState('networkidle');
  const total = (await Promise.all(sizes)).reduce((a, b) => a + b, 0);
  console.log(`JS loaded up front: ${Math.round(total / 1024)} KB`);
  expect(total).toBeLessThan(400_000);
});

test('the code editor loads when the Code tab is opened', async ({ page }) => {
  await page.goto('/inside/02-tokens/');
  await page.getByRole('tab', { name: 'Code' }).click();
  await expect(page.locator('#panel-code .cm-content')).toBeVisible();
});

test('the embedding map can be solved with the keyboard', async ({ page }) => {
  await page.goto('/inside/03-embeddings/');
  await page.getByRole('button', { name: 'Try the puzzle →' }).click();
  const queen = page.locator('#panel-puzzle').getByRole('button', { name: /queen at/ });
  await queen.focus();
  // (1, 6) → (4, 3): three steps right, three steps down
  for (const key of ['ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowDown', 'ArrowDown', 'ArrowDown']) {
    await page.locator('#panel-puzzle').getByRole('button', { name: /queen at/ }).press(key);
  }
  await expect(page.getByRole('dialog', { name: /Solved/ })).toBeVisible();
});

test('progress can be exported and imported from the menu', async ({ page, context }) => {
  await page.goto('/inside/01-next-token/');
  await page.getByRole('button', { name: 'Try the puzzle →' }).click();
  await page.locator('#panel-puzzle').getByRole('button', { name: 'Remove Germany' }).click();
  await page.locator('#panel-puzzle').getByRole('button', { name: 'Add France' }).click();
  await page.getByRole('button', { name: 'Keep playing' }).click();
  await page.getByRole('button', { name: /Menu/ }).click();
  await page.getByRole('button', { name: 'Export progress' }).click();
  const code = await page.getByLabel(/Copy this code/).inputValue();

  const freshContext = await context.browser()!.newContext({ baseURL: 'http://localhost:4322' });
  const fresh = await freshContext.newPage();
  await fresh.goto('/inside/');
  await expect(fresh.locator('[data-level-card="inside-1"]')).toContainText('Not solved yet');
  await fresh.getByRole('button', { name: /Menu/ }).click();
  await fresh.getByLabel(/Paste a progress code/).fill(code);
  await fresh.getByRole('button', { name: 'Import progress' }).click();
  await expect(fresh.getByRole('status').filter({ hasText: 'Progress imported.' })).toBeVisible();
  await expect(fresh.locator('[data-level-card="inside-1"]')).toContainText('Solved');
});

test('a bad import code is rejected', async ({ page }) => {
  await page.goto('/inside/');
  await page.getByRole('button', { name: /Menu/ }).click();
  await page.getByLabel(/Paste a progress code/).fill('nonsense');
  await page.getByRole('button', { name: 'Import progress' }).click();
  await expect(page.getByText("That doesn't look like a Learn LLMs progress code.")).toBeVisible();
});
