import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { command, expectSolved, openLevel, type } from './helpers';

const L1 = '01-next-token';
const EXAM = 'Exam: Next-token prediction';

/** Correct answers for level 1, in order: a choice label or typed text. */
const L1_ANSWERS: ({ choice: string } | { text: string })[] = [
  { choice: 'A probability for every token it knows' },
  { choice: 'It predicts one token, adds it to the context, and repeats' },
  { text: 'add France' },
  { text: 'rm germany' },
  { choice: 'The most recent words' },
];

async function solveLevel1(page: Page) {
  await openLevel(page, L1);
  await type(page, 'remove Germany');
  await type(page, 'add France');
  await expectSolved(page);
}

async function answer(page: Page, a: { choice: string } | { text: string }) {
  const dialog = page.getByRole('dialog', { name: EXAM });
  if ('choice' in a) await dialog.getByRole('radio', { name: a.choice }).check();
  else await dialog.getByLabel('Your answer').fill(a.text);
  await dialog.getByRole('button', { name: 'Check answer' }).click();
}

test('after solving, the learner can take the exam, score 5/5 and see the badge', async ({ page }) => {
  await solveLevel1(page);
  await page.getByRole('button', { name: /Take the exam/ }).click();
  const dialog = page.getByRole('dialog', { name: EXAM });
  for (let i = 0; i < L1_ANSWERS.length; i++) {
    await expect(dialog).toContainText(`Question ${i + 1} of 5`);
    await answer(page, L1_ANSWERS[i]);
    await expect(dialog.getByRole('status')).toContainText('Correct!');
    await dialog.getByRole('button', { name: i < 4 ? 'Next question →' : 'See your score' }).click();
  }
  await expect(dialog).toContainText('You scored 5 out of 5');
  await page.goto('/inside/');
  await expect(page.locator('[data-level-card="inside-1"]')).toContainText('Exam 5/5');
});

test('"Skip to next level" goes straight to level 2', async ({ page }) => {
  await solveLevel1(page);
  await page.getByRole('link', { name: /Skip to next level/ }).click();
  await expect(page).toHaveURL(/\/inside\/02-tokens\/$/);
});

test('the exam command opens the exam any time and explains wrong answers', async ({ page }) => {
  await openLevel(page, L1);
  await type(page, 'exam');
  const dialog = page.getByRole('dialog', { name: EXAM });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('radio', { name: 'A single word it is sure about' }).check();
  await dialog.getByRole('button', { name: 'Check answer' }).click();
  await expect(dialog.getByRole('status')).toContainText('Not quite.');
  await expect(dialog.getByRole('status')).toContainText('separate step');
});

test('a wrong command answer shows a correct example, and Retake starts over', async ({ page }) => {
  await openLevel(page, L1);
  await type(page, 'exam');
  const dialog = page.getByRole('dialog', { name: EXAM });
  for (let i = 0; i < 5; i++) {
    const a = L1_ANSWERS[i];
    if (i === 2) {
      await dialog.getByLabel('Your answer').fill('add Paris');
      await dialog.getByRole('button', { name: 'Check answer' }).click();
      await expect(dialog.getByRole('status')).toContainText('add France');
    } else {
      await answer(page, a);
    }
    await dialog.getByRole('button', { name: i < 4 ? 'Next question →' : 'See your score' }).click();
  }
  await expect(dialog).toContainText('You scored 4 out of 5');
  await dialog.getByRole('button', { name: 'Retake' }).click();
  await expect(dialog).toContainText('Question 1 of 5');
});

test('the exam works by keyboard and passes axe; Escape returns to the level', async ({ page }) => {
  await openLevel(page, L1);
  await type(page, 'exam');
  const dialog = page.getByRole('dialog', { name: EXAM });
  await expect(dialog).toBeVisible();
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.effect?.getTiming().iterations === Infinity || a.playState !== 'running'),
  );
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(command(page)).toBeFocused();
});

test('Enter checks an answer, Enter again moves on, and focus follows', async ({ page }) => {
  await openLevel(page, L1);
  await type(page, 'exam');
  const dialog = page.getByRole('dialog', { name: EXAM });
  await expect(dialog.getByRole('radio').first()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(dialog.getByRole('status')).toContainText('Correct!');
  await expect(dialog.getByRole('button', { name: 'Next question →' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dialog).toContainText('Question 2 of 5');
  await expect(dialog.getByRole('radio').first()).toBeFocused();
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(dialog).toContainText('Question 3 of 5');
  await expect(dialog.getByLabel('Your answer')).toBeFocused();
  await page.keyboard.type('add France');
  await page.keyboard.press('Enter');
  await expect(dialog.getByRole('status')).toContainText('Correct!');
  await page.keyboard.press('Enter');
  await expect(dialog).toContainText('Question 4 of 5');
});

test.describe('phone', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  test('the exam can be answered by tapping', async ({ page }) => {
    await openLevel(page, L1);
    await page.getByRole('navigation', { name: 'Quick commands' }).getByRole('button', { name: 'Exam' }).tap();
    const dialog = page.getByRole('dialog', { name: EXAM });
    await dialog.getByRole('radio', { name: 'A probability for every token it knows' }).tap();
    await dialog.getByRole('button', { name: 'Check answer' }).tap();
    await expect(dialog.getByRole('status')).toContainText('Correct!');
  });
});
