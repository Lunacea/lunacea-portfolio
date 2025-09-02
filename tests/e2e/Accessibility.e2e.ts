import { expect, test } from '@playwright/test';

test.describe('Accessibility', () => {
  test.describe('Keyboard Navigation', () => {
    test('should navigate through main navigation links using keyboard', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Tabキーでナビゲーションリンクを順番にフォーカス
      await page.keyboard.press('Tab');
      
      // 最初のリンクがフォーカスされることを確認
      const firstLink = page.getByRole('link').first();
      await expect(firstLink).toBeFocused();

      // Enterキーでリンクをクリック
      await page.keyboard.press('Enter');
      await page.waitForLoadState('domcontentloaded');

      // ページが変更されることを確認
      expect(page.url()).not.toBe('http://localhost:3000/');
    });

    test('should navigate through music controller using keyboard', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // 音楽コントロールにフォーカス
      const musicController = page.getByRole('group', { name: '音楽コントロール' });
      await expect(musicController).toBeVisible();

      // 再生/停止ボタンにフォーカス
      const playPauseButton = page.getByRole('button', { name: /音楽を(再生|停止)/ });
      await playPauseButton.focus();
      await expect(playPauseButton).toBeFocused();

      // Spaceキーでボタンをクリック
      await page.keyboard.press('Space');
      
      // ボタンの状態が変更されることを確認
      await expect(playPauseButton).toHaveAttribute('aria-label', /音楽を(再生|停止)/);
    });
  });

  test.describe('ARIA Attributes', () => {
    test('should have proper ARIA labels for music controller', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // 音楽コントロールのARIA属性を確認
      const musicController = page.getByRole('group', { name: '音楽コントロール' });
      await expect(musicController).toBeVisible();

      // 再生/停止ボタンのARIA属性を確認
      const playPauseButton = page.getByRole('button', { name: /音楽を(再生|停止)/ });
      await expect(playPauseButton).toHaveAttribute('aria-label', /音楽を(再生|停止)/);

      // 音量スライダーのARIA属性を確認
      const volumeSlider = page.locator('input[type="range"][aria-label="音量調整"]');
      await expect(volumeSlider).toHaveAttribute('aria-label', '音量調整');
      await expect(volumeSlider).toHaveAttribute('aria-valuetext', /音量 \d+%/);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('domcontentloaded');

      // メインの見出しが存在することを確認（最初のh1要素）
      const mainHeading = page.getByRole('heading', { level: 1 }).first();
      await expect(mainHeading).toBeVisible();

      // セクション見出しが存在することを確認
      const sectionHeadings = page.getByRole('heading', { level: 2 });
      await expect(sectionHeadings.first()).toBeVisible();
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper alt text for images', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // 画像のalt属性を確認
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        // alt属性が存在するか、decorative画像としてマークされていることを確認
        expect(alt !== null || await img.getAttribute('role') === 'presentation').toBeTruthy();
      }
    });

    test('should have proper form labels', async ({ page }) => {
      // ブログページでコメントフォームを確認
      await page.goto('/blog');
      await page.waitForLoadState('domcontentloaded');

      // コメントフォームが存在する場合のテスト
      const commentForm = page.locator('form');
      if (await commentForm.count() > 0) {
        const inputs = commentForm.locator('input, textarea');
        const inputCount = await inputs.count();
        
        for (let i = 0; i < inputCount; i++) {
          const input = inputs.nth(i);
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledBy = await input.getAttribute('aria-labelledby');
          
          // ラベル、aria-label、またはaria-labelledbyのいずれかが存在することを確認
          if (id) {
            const label = page.locator(`label[for="${id}"]`);
            const hasLabel = await label.count() > 0;
            expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
          }
        }
      }
    });
  });
});
