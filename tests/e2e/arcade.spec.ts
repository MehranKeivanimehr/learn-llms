import { expect, test } from '@playwright/test';
import { canvas, command, expectSolved, openLevel, terminalLog, type } from './helpers';

const L1 = '01-next-token';

test('the intro dialog walks through the lesson and can be reopened', async ({ page }) => {
  await page.goto(`/inside/${L1}/`);
  const dialog = page.getByRole('dialog', { name: 'One trick, repeated' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Next →' }).click();
  await expect(page.getByRole('dialog', { name: 'Guesses are probabilities' })).toBeVisible();
  await page.getByRole('button', { name: '← Back' }).click();
  await expect(page.getByRole('dialog', { name: 'One trick, repeated' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Instructions' }).click();
  await expect(page.getByRole('dialog', { name: 'One trick, repeated' })).toBeVisible();
});

test('Tab stays inside an open dialog', async ({ page }) => {
  await page.goto(`/inside/${L1}/`);
  const dialog = page.getByRole('dialog', { name: 'One trick, repeated' });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  }
});

test('typing commands solves level 1 and the level stays solved', async ({ page }) => {
  await openLevel(page, L1);
  await type(page, 'remove Germany');
  await type(page, 'add France');
  await expectSolved(page);
  await expect(page.getByRole('dialog', { name: 'Solved!' })).toContainText('exactly par');
  await page.reload();
  await expect(command(page)).toBeEnabled();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('help, typos and unknown commands answer in the terminal', async ({ page }) => {
  await openLevel(page, L1);
  await type(page, 'help');
  await expect(terminalLog(page)).toContainText('add <word>');
  await type(page, 'hnit');
  await expect(terminalLog(page)).toContainText('Did you mean "hint"?');
  await type(page, 'add Tokyo');
  await expect(terminalLog(page)).toContainText(`"Tokyo" isn't in this model's vocabulary`);
  await expect(canvas(page).locator('.moves')).toContainText('Moves: 0');
});

test('Tab completes commands, then lets focus move on; arrow up recalls history', async ({ page }) => {
  await openLevel(page, L1);
  await command(page).fill('ad');
  await command(page).press('Tab');
  await expect(command(page)).toHaveValue('add ');
  await command(page).fill('predict');
  await command(page).press('Enter');
  await command(page).press('ArrowUp');
  await expect(command(page)).toHaveValue('predict');
  await command(page).fill('xyz');
  await command(page).press('Tab');
  await expect(command(page)).not.toBeFocused();
});

test('the levels command opens the level map and navigates', async ({ page }) => {
  await openLevel(page, L1);
  await type(page, 'levels');
  const dialog = page.getByRole('dialog', { name: 'Choose a level' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('link', { name: /Tokens/ }).click();
  await expect(page).toHaveURL(/\/inside\/02-tokens\/$/);
});

test('the code drawer opens, runs tests, and returns focus when closed', async ({ page }) => {
  await openLevel(page, L1);
  const codeButton = page.getByRole('navigation', { name: 'Quick commands' }).getByRole('button', { name: 'Code' });
  await codeButton.click();
  const drawer = page.getByRole('dialog', { name: 'Code challenge' });
  await drawer.locator('.cm-content').fill('function argmax(p) { let b = 0; for (let i = 1; i < p.length; i++) if (p[i] > p[b]) b = i; return b; }');
  await drawer.getByRole('button', { name: 'Run tests' }).click();
  await expect(drawer.getByText('All tests pass!')).toBeVisible();
  await drawer.getByRole('button', { name: 'Close code challenge' }).click();
  await expect(codeButton).toBeFocused();
});

test('"Show me" types commands, locks input while playing, then resets the puzzle', async ({ page }) => {
  await page.goto(`/inside/${L1}/`);
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Next →' }).click();
  await page.getByRole('button', { name: 'Show me' }).click();
  await expect(command(page)).toBeDisabled();
  await expect(terminalLog(page)).toContainText('Your turn! The puzzle has been reset.', { timeout: 15_000 });
  await expect(terminalLog(page)).toContainText('add a');
  await expect(command(page)).toBeEnabled();
  await expect(canvas(page).locator('.moves')).toContainText('Moves: 0');
});

test('"Solution" replays the answer and records the level as solved without a score', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await openLevel(page, L1);
  await page.getByRole('navigation', { name: 'Quick commands' }).getByRole('button', { name: 'Solution' }).click();
  await expectSolved(page);
  await expect(page.getByRole('dialog', { name: 'Solved!' })).toContainText('watched the solution');
});

test('a second Tab after completing a command lists the arguments and keeps focus', async ({ page }) => {
  await openLevel(page, L1);
  await command(page).fill('ad');
  await command(page).press('Tab');
  await expect(command(page)).toHaveValue('add ');
  await command(page).press('Tab');
  await expect(command(page)).toBeFocused();
  await expect(terminalLog(page)).toContainText('France');
});

test('after "Show me" the command line has keyboard focus again', async ({ page }) => {
  await page.goto(`/inside/${L1}/`);
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Next →' }).click();
  await page.getByRole('button', { name: 'Show me' }).click();
  await expect(terminalLog(page)).toContainText('Your turn!', { timeout: 15_000 });
  await expect(command(page)).toBeFocused();
});

test('the demo typing line is hidden from screen readers', async ({ page }) => {
  await page.goto(`/inside/${L1}/`);
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Next →' }).click();
  await page.getByRole('button', { name: 'Show me' }).click();
  const ghost = terminalLog(page).locator('.term-line.ghost');
  await expect(ghost).toBeVisible();
  await expect(ghost).toHaveAttribute('aria-hidden', 'true');
});

test('the level 2 token counter is not a live region', async ({ page }) => {
  await openLevel(page, '02-tokens');
  await expect(canvas(page).locator('.big-number')).not.toHaveAttribute('aria-live', /.+/);
});
