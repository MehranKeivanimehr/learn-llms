import { expect, type Page } from '@playwright/test';

/** Opens a level and dismisses the intro dialog (shown on unsolved levels). */
export async function openLevel(page: Page, slug: string) {
  await page.goto(`/inside/${slug}/`);
  await page.getByRole('button', { name: 'Close lesson' }).click();
  await expect(command(page)).toBeEnabled();
}

export function command(page: Page) {
  return page.getByLabel('Command', { exact: true });
}

export function canvas(page: Page) {
  return page.getByRole('region', { name: 'Canvas' });
}

export function terminalLog(page: Page) {
  return page.getByRole('log', { name: 'Command history' });
}

export async function type(page: Page, line: string) {
  await command(page).fill(line);
  await command(page).press('Enter');
}

export async function expectSolved(page: Page) {
  await expect(page.getByRole('dialog', { name: 'Solved!' })).toBeVisible({ timeout: 10_000 });
}
