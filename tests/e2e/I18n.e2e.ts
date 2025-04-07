import { expect, test } from '@playwright/test';

test.describe('I18n', () => {
  test.describe('Language Switching', () => {
    test('should switch language from Japanese to English using dropdown and verify text on the homepage', async ({ page }) => {
      await page.goto('/');

      await expect(
        page.getByRole('heading', { name: 'Next.jsとTailwind CSSのスターターコード' }),
      ).toBeVisible();

      await page.getByLabel('lang-switcher').selectOption('en');

      await expect(
        page.getByRole('heading', { name: 'Boilerplate Code for Your Next.js Project with Tailwind CSS' }),
      ).toBeVisible();
    });

    test('should switch language from Japanese to English using URL and verify text on the sign-in page', async ({ page }) => {
      await page.goto('/sign-in');

      await expect(page.getByText('メールアドレス')).toBeVisible();

      await page.goto('/en/sign-in');

      await expect(page.getByText('Email address')).toBeVisible();
    });
  });
});
