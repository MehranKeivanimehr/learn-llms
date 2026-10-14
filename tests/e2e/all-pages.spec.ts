import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { SLUGS } from './levels';

const PAGES = ['/', '/inside/', '/about/', ...SLUGS.map((s) => `/inside/${s}/`)];

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target.join(' ')) }));
}

for (const path of PAGES) {
  test(`${path} loads without errors and passes axe`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(await seriousViolations(page)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for (const slug of SLUGS) {
  test(`${slug}: puzzle and code panels render and pass axe`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(`/inside/${slug}/`);
    await page.getByRole('button', { name: 'Try the puzzle →' }).click();
    await expect(page.locator('#panel-puzzle .side')).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
    await page.getByRole('tab', { name: 'Code' }).click();
    await expect(page.locator('#panel-code .cm-content')).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('dark theme passes axe', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/inside/04-sampling/');
  await page.getByRole('button', { name: 'Try the puzzle →' }).click();
  expect(await seriousViolations(page)).toEqual([]);
});
