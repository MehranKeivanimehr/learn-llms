import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { command, expectSolved, openLevel, type } from './helpers';
import { SLUGS } from './levels';

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

async function serious(page: Page) {
  // Let entrance animations (fades, pops) finish so contrast is measured on the final colours.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.effect?.getTiming().iterations === Infinity || a.playState !== 'running'),
  );
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target.join(' ')) }));
}

for (const path of ['/', '/inside/', '/about/']) {
  test(`${path} loads without errors and passes axe`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(await serious(page)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for (const slug of SLUGS) {
  test(`${slug}: intro dialog and arcade screen pass axe`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(`/inside/${slug}/`);
    await expect(page.getByRole('button', { name: 'Close lesson' })).toBeVisible();
    expect(await serious(page)).toEqual([]);
    await page.getByRole('button', { name: 'Close lesson' }).click();
    await expect(command(page)).toBeEnabled();
    expect(await serious(page)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('level map, code drawer and completion dialog pass axe', async ({ page }) => {
  await openLevel(page, '01-next-token');
  await type(page, 'levels');
  await expect(page.getByRole('dialog', { name: 'Choose a level' })).toBeVisible();
  expect(await serious(page)).toEqual([]);
  await page.keyboard.press('Escape');
  await type(page, 'code');
  await expect(page.getByRole('dialog', { name: 'Code challenge' }).locator('.cm-content')).toBeVisible();
  expect(await serious(page)).toEqual([]);
  await page.getByRole('button', { name: 'Close code challenge' }).click();
  await type(page, 'remove Germany');
  await type(page, 'add France');
  await expectSolved(page);
  expect(await serious(page)).toEqual([]);
});
