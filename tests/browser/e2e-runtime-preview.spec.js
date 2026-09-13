import { expect, test } from '@playwright/test';

test('completes the generated E2E lesson through the runtime preview', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/#preview/e2e-material-generation');
  await expect(page.getByRole('heading', { name: '動詞の後ろの形を比べて使う' })).toBeVisible();
  await expect(page.getByText('E2E-LESSON-001')).toBeVisible();
  await expect(page.getByText('Generated E2E Preview')).toBeVisible();
  await expect(page.getByText('Synthetic source')).toBeVisible();
  await expect(page.getByText('Transient — not in Canonical Lesson Registry')).toBeVisible();
  await expect(page.getByText('stop + gerundとstop + to-infinitive')).toBeVisible();

  await page.getByRole('button', { name: /smoking/ }).click();
  await expect(page.getByText('You explored all sentence differences.')).toBeVisible();
  const nextButton = page.getByRole('button', { name: 'Next →' });
  await expect(nextButton).toBeEnabled();
  await nextButton.click();

  await expect(page.getByText('decide の後ろの to-infinitive に注目して')).toBeVisible();
  for (const word of ['They', 'decided', 'to', 'study', 'English']) {
    await page.getByRole('button', { name: word, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText(/Correct —/)).toBeVisible();
  await expect(page.getByText('Step complete — 次の気づきへ進めます。')).toBeVisible();
  await expect(nextButton).toBeEnabled();
  await nextButton.click();

  await expect(page.getByText('avoid の後ろの動詞の形を正しく直してください。')).toBeVisible();
  await page.getByRole('button', { name: /to waste/ }).click();
  await page.getByRole('button', { name: /wasting/ }).click();
  await expect(page.getByText(/Correct\./)).toBeVisible();
  await expect(page.getByText('Lesson complete — すべてのStepを完了しました。')).toBeVisible();
  await expect(page.getByText('3 / 3 steps complete · 100% complete')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next →' })).toBeDisabled();
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('keeps the canonical lesson route separate from the runtime preview', async ({ page }) => {
  await page.goto('/#lessons/infinitives');
  await expect(page.getByRole('heading', { name: '不定詞を形・役割・目的から使う' })).toBeVisible();
  await expect(page.getByText('Generated E2E Preview')).toHaveCount(0);
  await expect(page.getByText('I want to study English. を組み立て')).toBeVisible();
});
