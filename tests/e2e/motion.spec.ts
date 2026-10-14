import { expect, test } from '@playwright/test';
import { expectSolved, openLevel, type } from './helpers';
import { SLUGS } from './levels';

test('with normal motion, solving shows the burst before the dialog', async ({ page }) => {
  await openLevel(page, '01-next-token');
  await type(page, 'remove Germany');
  await type(page, 'add France');
  await expect(page.locator('.burst')).toBeVisible();
  await expectSolved(page);
});

test('with reduced motion there is no burst and the level still completes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLevel(page, '01-next-token');
  await type(page, 'remove Germany');
  await type(page, 'add France');
  await expectSolved(page);
  await expect(page.locator('.burst')).toHaveCount(0);
});

test.describe('desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } });
  for (const slug of SLUGS) {
    test(`${slug} fits the screen without page scrolling`, async ({ page }) => {
      await openLevel(page, slug);
      const size = await page.evaluate(() => ({
        h: document.documentElement.scrollHeight,
        w: document.documentElement.scrollWidth,
        vh: window.innerHeight,
        vw: window.innerWidth,
      }));
      expect(size.h).toBeLessThanOrEqual(size.vh + 1);
      expect(size.w).toBeLessThanOrEqual(size.vw);
    });
  }
});

test.describe('laptop screen', () => {
  test.use({ viewport: { width: 1366, height: 768 } });
  test('the goal window and help bar stay on screen while the canvas scrolls', async ({ page }) => {
    await openLevel(page, '04-sampling');
    await page.locator('.scene-scroll').evaluate((el) => el.scrollTo(0, el.scrollHeight));
    const goal = await page.getByRole('complementary', { name: 'Goal' }).boundingBox();
    const help = await page.getByRole('navigation', { name: 'Quick commands' }).boundingBox();
    expect(goal!.y).toBeGreaterThanOrEqual(0);
    expect(help!.y + help!.height).toBeLessThanOrEqual(768);
  });
});
