import { expect, test } from '@playwright/test';

test.describe('BGMPlayer', () => {
  test.beforeEach(async ({ page }) => {
    // ページを先に読み込んでからlocalStorageとsessionStorageをクリア
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('bgmUserConsent');
      localStorage.removeItem('bgm-permission');
      localStorage.removeItem('bgm-volume');
      localStorage.removeItem('bgm-muted');
      sessionStorage.removeItem('visitedAnyRoute');
    });
    // 新しいページコンテキストでリロード
    await page.reload();
    
    // テスト環境ではモーダルが無効化されているため、追加の処理は不要
  });



  test('should display music controller on page load', async ({ page }) => {
    // ページが読み込まれるまで待機
    await page.waitForLoadState('domcontentloaded');

    // 音楽コントロールが表示されることを確認
    const musicController = page.getByRole('group', { name: '音楽コントロール' });
    await expect(musicController).toBeVisible({ timeout: 5000 });
  });

  test('should have clickable play/pause button with correct aria-label', async ({ page }) => {
    // ページが読み込まれるまで待機
    await page.waitForLoadState('domcontentloaded');

    // 再生/一時停止ボタンを取得
    const playPauseButton = page.getByRole('button', { name: /音楽を(再生|停止)/ });

    await expect(playPauseButton).toBeVisible({ timeout: 5000 });

    // ボタンがクリック可能であることを確認
    await expect(playPauseButton).toBeEnabled();

    // ボタンをクリック
    await playPauseButton.click();

    // ボタンが適切なaria-labelを持っていることを確認
    await expect(playPauseButton).toHaveAttribute('aria-label', /音楽を(再生|停止)/, { timeout: 3000 });
  });

  test('should have volume control slider', async ({ page }) => {
    // ページが読み込まれるまで待機
    await page.waitForLoadState('domcontentloaded');

    // 音量スライダーが表示されることを確認（デスクトップ表示時のみ）
    const volumeSlider = page.locator('input[type="range"][aria-label="音量調整"]');
    
    // デスクトップ表示では音量スライダーが表示される
    await expect(volumeSlider).toBeVisible({ timeout: 5000 });
    
    // スライダーが操作可能であることを確認
    await expect(volumeSlider).toBeEnabled();
  });
});
