import { expect, test } from '@playwright/test';

// ビジュアルテストを有効化（Percy統合のため）
test.describe('Visual testing', () => {
  test.describe('Static pages', () => {
    test('should take screenshot of the homepage', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.getByRole('main')).toBeVisible();

      // ホームページのスクリーンショットを取得
      await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
      
      // Percy用のビジュアルテスト（CI環境でのみ実行）
      if (process.env.CI && process.env.PERCY_TOKEN) {
        await page.screenshot({ name: 'Homepage' });
      }
    });

    test('should take screenshot of the profile page', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.getByText('Mission')).toBeVisible();

      // プロフィールページのスクリーンショットを取得
      await page.screenshot({ path: 'test-results/profile.png', fullPage: true });
      
      // Percy用のビジュアルテスト（CI環境でのみ実行）
      if (process.env.CI && process.env.PERCY_TOKEN) {
        await page.screenshot({ name: 'Profile Page' });
      }
    });

    test('should take screenshot of the works page', async ({ page }) => {
      await page.goto('/works');
      await page.waitForLoadState('domcontentloaded');

      // 作品ページのタイトルが表示されることを確認（最初の要素のみ）
      await expect(page.getByText('Works', { exact: true }).first()).toBeVisible();

      // 作品ページのスクリーンショットを取得
      await page.screenshot({ path: 'test-results/works.png', fullPage: true });
      
      // Percy用のビジュアルテスト（CI環境でのみ実行）
      if (process.env.CI && process.env.PERCY_TOKEN) {
        await page.screenshot({ name: 'Works Page' });
      }
    });

    test('should take screenshot of the blog page', async ({ page }) => {
      await page.goto('/blog');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.getByText('Blog', { exact: true }).first()).toBeVisible();

      // ブログページのスクリーンショットを取得
      await page.screenshot({ path: 'test-results/blog.png', fullPage: true });
      
      // Percy用のビジュアルテスト（CI環境でのみ実行）
      if (process.env.CI && process.env.PERCY_TOKEN) {
        await page.screenshot({ name: 'Blog Page' });
      }
    });

    test('should take screenshot of the English homepage', async ({ page }) => {
      await page.goto('/en');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.getByRole('main')).toBeVisible();

      // 英語版ホームページのスクリーンショットを取得
      await page.screenshot({ path: 'test-results/homepage-en.png', fullPage: true });
      
      // Percy用のビジュアルテスト（CI環境でのみ実行）
      if (process.env.CI && process.env.PERCY_TOKEN) {
        await page.screenshot({ name: 'English Homepage' });
      }
    });

    test('should take screenshot of MDX styling test page', async ({ page }) => {
      await page.goto('/blog/markdown-styling-test');
      await page.waitForLoadState('domcontentloaded');

      // ページのタイトルが表示されることを確認
      await expect(page.getByText('MDX + Markdown + Math testing completed!')).toBeVisible();

      // MDXカスタムボックスが表示されることを確認
      await expect(page.getByText('MDXカスタムボックス')).toBeVisible();

      // Mermaid図表が表示されることを確認（レンダリング完了まで待機）
      await page.waitForSelector('.mermaid-diagram svg', { timeout: 10000 });

      // MDXスタイリングテストページのスクリーンショットを取得
      await page.screenshot({ path: 'test-results/mdx-styling-test.png', fullPage: true });
      
      // Percy用のビジュアルテスト（CI環境でのみ実行）
      if (process.env.CI && process.env.PERCY_TOKEN) {
        await page.screenshot({ name: 'MDX Styling Test Page' });
      }
    });
  });
});
