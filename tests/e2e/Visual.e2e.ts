import { expect, test } from '@playwright/test';

test.describe('Visual testing', () => {
  test.describe('Static pages', () => {
    test('should take screenshot of the homepage', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.getByRole('main')).toBeVisible();

      // ホームページのスクリーンショットを取得
      await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
    });

    test('should take screenshot of the profile page', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.getByText('Mission')).toBeVisible();

      // プロフィールページのスクリーンショットを取得
      await page.screenshot({ path: 'test-results/profile.png', fullPage: true });
    });

    test('should take screenshot of the works page', async ({ page }) => {
      await page.goto('/works');
      await page.waitForLoadState('domcontentloaded');

      // 作品ページのタイトルが表示されることを確認（最初の要素のみ）
      await expect(page.getByText('Works', { exact: true }).first()).toBeVisible();

      // 作品ページのスクリーンショットを取得
      await page.screenshot({ path: 'test-results/works.png', fullPage: true });
    });

    test('should take screenshot of the blog page', async ({ page }) => {
      await page.goto('/blog');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.getByText('Blog', { exact: true }).first()).toBeVisible();

      // ブログページのスクリーンショットを取得
      await page.screenshot({ path: 'test-results/blog.png', fullPage: true });
    });

    test('should take screenshot of the English homepage', async ({ page }) => {
      await page.goto('/en');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.getByRole('main')).toBeVisible();

      // 英語版ホームページのスクリーンショットを取得
      await page.screenshot({ path: 'test-results/homepage-en.png', fullPage: true });
    });

    test('should take screenshot of music controller', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // 音楽コントロールのスクリーンショットを取得
      const musicController = page.getByRole('group', { name: '音楽コントロール' });
      await expect(musicController).toBeVisible();
      
      // 音楽コントロールのスクリーンショットを取得
      const boundingBox = await musicController.boundingBox();
      if (boundingBox) {
        await page.screenshot({ path: 'test-results/music-controller.png', clip: boundingBox });
      } else {
        // フォールバック: 音楽コントロールのスクリーンショットを取得
        await musicController.screenshot({ path: 'test-results/music-controller.png' });
      }
    });
  });
});
