import { expect, test } from '@playwright/test';

test('supports wrong-answer review, reset, and correct-answer review', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/#interactions/exam-multiple-choice');
  await expect(page.locator('h1')).toHaveText('Exam Multiple Choice');
  await expect(page.locator('.entry-id')).toHaveText('GRAM-INT-041');
  await expect(page.locator('[data-exam-choice-id]')).toHaveCount(4);

  const submitButton = page.getByRole('button', { name: '解答する' });
  await expect(submitButton).toBeDisabled();
  await page.locator('[data-exam-choice-id="c1"]').click();
  await expect(submitButton).toBeEnabled();
  await page.locator('[data-exam-choice-id="c2"]').click();
  await expect(page.locator('[data-exam-choice-id="c1"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-exam-choice-id="c2"]')).toHaveAttribute('aria-pressed', 'true');
  await submitButton.click();

  await expect(page.getByText("× 不正解です。正解：3. haven't seen")).toBeVisible();
  await expect(page.getByText('Grammar explanation')).toBeVisible();
  await expect(page.locator('.exam-mc-option-review')).toHaveCount(4);
  await expect(page.getByText('since last year は過去から現在までの継続を表すため、現在完了が適切です。')).toBeVisible();
  await expect(page.locator('[data-exam-choice-id="c1"]')).toBeDisabled();

  const resetButton = page.getByRole('button', { name: 'もう一度解く' });
  await expect(resetButton).toBeVisible();
  await resetButton.click();
  await expect(submitButton).toBeDisabled();
  await expect(page.locator('[data-exam-result]')).toBeHidden();
  await expect(page.getByText('Grammar explanation')).toBeHidden();
  await expect(page.locator('[data-exam-choice-id="c1"]')).toBeFocused();

  await page.locator('[data-exam-choice-id="c3"]').click();
  await submitButton.click();
  await expect(page.getByText('○ 正解です')).toBeVisible();
  await expect(page.locator('.exam-mc-option-review')).toHaveCount(4);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('can submit and reset the exam choice with keyboard only', async ({ page }) => {
  await page.goto('/#interactions/exam-multiple-choice');
  const choice = page.locator('[data-exam-choice-id="c3"]');
  await choice.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByText('○ 正解です')).toBeVisible();
  await expect(page.locator('[data-exam-result]')).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: '解答する' })).toBeDisabled();
  await expect(page.locator('[data-exam-choice-id="c1"]')).toBeFocused();
});

test('fits the exam choice flow at a 390px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#interactions/exam-multiple-choice');
  await expect(page.locator('[data-exam-choice-id]')).toHaveCount(4);
  await expect(page.locator('.exam-mc-stem')).toBeVisible();
  await expect(page.getByRole('button', { name: '解答する' })).toBeVisible();

  const layout = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.innerWidth).toBe(390);
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);

  await page.locator('[data-exam-choice-id="c1"]').click();
  await page.getByRole('button', { name: '解答する' }).click();
  await expect(page.locator('.exam-mc-option-review')).toHaveCount(4);
  await expect(page.getByText("× 不正解です。正解：3. haven't seen")).toBeVisible();
});

test('keeps the existing demo routes renderable', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const existingDemoSlugs = [
    'word-order-builder',
    'mark-the-parts',
    'sentence-transformer',
    'grammar-classifier',
    'sentence-pattern-diagram',
    'modifier-connection-viewer',
    'sentence-comparison',
    'error-corrector',
    'context-grammar',
    'sentence-generator',
    'modifier-positioner',
  ];

  for (const slug of existingDemoSlugs) {
    await page.goto(`/#interactions/${slug}`);
    await expect(page.locator('.demo-panel')).toBeVisible();
    await expect(page.locator('.demo-stage')).toBeVisible();
  }

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
