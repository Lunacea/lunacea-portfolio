import { expect, test } from '@playwright/test';

test.describe('Theme', () => {
  test.describe('Theme Toggle', () => {
    test('should have theme toggle button visible', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // テーマ切り替えボタンが存在することを確認
      const themeToggle = page.getByRole('button', { name: 'テーマを切り替え' });
      await expect(themeToggle).toBeVisible();
    });

    test('should have proper accessibility attributes for theme toggle', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // テーマ切り替えボタンを探す
      const themeToggle = page.getByRole('button', { name: 'テーマを切り替え' });

      // アクセシビリティ属性を確認
      await expect(themeToggle).toBeVisible();
      await expect(themeToggle).toBeEnabled();
      
      // キーボード操作が可能であることを確認
      await themeToggle.focus();
      await expect(themeToggle).toBeFocused();
    });
  });
});
