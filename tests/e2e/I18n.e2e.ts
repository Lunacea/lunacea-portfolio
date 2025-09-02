import { expect, test } from '@playwright/test';

test.describe('I18n', () => {
  test.describe('Language Switching', () => {
    test('should switch language from Japanese to English using URL and verify text on the homepage', async ({ page }) => {
      // 日本語版ホームページにアクセス
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // 日本語のテキストが表示されることを確認（モーダルが表示される場合）
      const japaneseModal = page.locator('.modalRoot.visibleState');
      if (await japaneseModal.count() > 0) {
        await expect(page.getByText('このサイトでは音楽が流れます。')).toBeVisible();
      }

      // 英語版ホームページにアクセス
      await page.goto('/en');
      await page.waitForLoadState('domcontentloaded');

      // 英語のテキストが表示されることを確認（モーダルが表示される場合）
      const englishModal = page.locator('.modalRoot.visibleState');
      if (await englishModal.count() > 0) {
        await expect(page.getByText('This site can play background music.')).toBeVisible();
      }
    });

    test('should switch language from Japanese to English using URL and verify navigation links', async ({ page }) => {
      // 日本語版プロフィールページにアクセス
      await page.goto('/profile');
      await page.waitForLoadState('domcontentloaded');

      // 日本語のナビゲーションリンクが表示されることを確認
      await expect(page.getByRole('link', { name: 'PROFILE' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'WORKS' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'BLOG' })).toBeVisible();

      // 英語版プロフィールページにアクセス
      await page.goto('/en/profile');
      await page.waitForLoadState('domcontentloaded');

      // 英語のナビゲーションリンクが表示されることを確認
      await expect(page.getByRole('link', { name: 'PROFILE' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'WORKS' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'BLOG' })).toBeVisible();
    });

    test('should display English navigation links', async ({ page }) => {
      // 英語版ホームページにアクセス
      await page.goto('/en');
      await page.waitForLoadState('domcontentloaded');

      // 英語版のナビゲーションリンクが表示されることを確認
      await expect(page.getByRole('link', { name: 'PROFILE' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'WORKS' }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'BLOG' }).first()).toBeVisible();
    });
  });
});
