import { expect, test } from '@playwright/test';

test.describe('BGMPlayer', () => {
  test.beforeEach(async ({ page }) => {
    // localStorageをクリアして初回訪問状態をシミュレート
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('bgm-permission');
      localStorage.removeItem('bgm-volume');
      localStorage.removeItem('bgm-muted');
    });
    await page.reload();
  });

  test('debug BGM controls visibility', async ({ page }) => {
    // ページが読み込まれるまで待機
    await page.waitForLoadState('domcontentloaded');

    // 許可ダイアログで許可を選択
    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: '許可' }).click();

    await expect(dialog).not.toBeVisible({ timeout: 3000 });

    // BGMPlayerコンポーネント全体を確認
    const bgmPlayer = page.locator('[data-testid="bgm-player"]');
    console.warn('BGMPlayer element exists:', await bgmPlayer.count());

    // すべてのボタン要素を取得
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.warn('Total buttons found:', buttonCount);

    for (let i = 0; i < buttonCount; i++) {
      const button = allButtons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const isVisible = await button.isVisible();
      const styles = await button.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity,
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          position: computed.position,
          zIndex: computed.zIndex,
        };
      });
      console.warn(`Button ${i}: text="${text}", aria-label="${ariaLabel}", visible=${isVisible}, styles=`, styles);
    }

    // 特定のBGMコントロールボタンを探す
    const bgmToggleButton = page.getByRole('button', { name: /BGMを/ });
    const bgmSettingsButton = page.getByRole('button', { name: 'BGM設定' });

    console.warn('BGM toggle button count:', await bgmToggleButton.count());
    console.warn('BGM settings button count:', await bgmSettingsButton.count());

    // BGMトグルボタンのスタイルを確認
    await expect(bgmToggleButton).toBeVisible();

    const toggleStyles = await bgmToggleButton.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        position: computed.position,
        zIndex: computed.zIndex,
        width: computed.width,
        height: computed.height,
      };
    });
    console.warn('BGM toggle button styles:', toggleStyles);

    // BGM設定ボタンのスタイルを確認
    await expect(bgmSettingsButton).toBeVisible();

    const settingsStyles = await bgmSettingsButton.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        position: computed.position,
        zIndex: computed.zIndex,
        width: computed.width,
        height: computed.height,
      };
    });
    console.warn('BGM settings button styles:', settingsStyles);

    // BGMPlayerコンポーネント全体のスタイルも確認
    await expect(bgmPlayer).toBeVisible();

    const playerStyles = await bgmPlayer.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
        position: computed.position,
        zIndex: computed.zIndex,
        width: computed.width,
        height: computed.height,
      };
    });
    console.warn('BGMPlayer container styles:', playerStyles);
  });

  test('should display permission dialog on first visit', async ({ page }) => {
    // ページが読み込まれるまで待機
    await page.waitForLoadState('domcontentloaded');

    // 許可ダイアログが表示されることを確認
    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible({ timeout: 5000 });

    // ダイアログの内容を確認
    await expect(page.getByText('このサイトではBGMを再生します。音楽の再生を許可しますか？')).toBeVisible();
    await expect(page.getByRole('button', { name: '許可' })).toBeVisible();
    await expect(page.getByRole('button', { name: '拒否' })).toBeVisible();
  });

  test('should hide dialog and show controls when permission is granted', async ({ page }) => {
    // ページが読み込まれるまで待機
    await page.waitForLoadState('domcontentloaded');

    // 許可ダイアログが表示されることを確認
    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 許可ボタンをクリック
    await page.getByRole('button', { name: '許可' }).click();

    // ダイアログが非表示になることを確認
    await expect(dialog).not.toBeVisible({ timeout: 3000 });

    // BGMコントロールが表示されることを確認
    await expect(page.getByRole('button', { name: 'BGM設定' })).toBeVisible({ timeout: 3000 });
    await expect(page.getByRole('button', { name: /BGMを/ })).toBeVisible();
  });

  test('should hide dialog when permission is denied', async ({ page }) => {
    // ページが読み込まれるまで待機
    await page.waitForLoadState('domcontentloaded');

    // 許可ダイアログが表示されることを確認
    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 拒否ボタンをクリック
    await page.getByRole('button', { name: '拒否' }).click();

    // ダイアログが非表示になることを確認
    await expect(dialog).not.toBeVisible({ timeout: 3000 });

    // BGMコントロールが表示されないことを確認
    await expect(page.getByRole('button', { name: 'BGM設定' })).toBeHidden();
  });

  test('should remember permission choice on page reload', async ({ page }) => {
    // ページが読み込まれるまで待機
    await page.waitForLoadState('domcontentloaded');

    // 許可ダイアログが表示されることを確認
    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible({ timeout: 5000 });

    // 許可ボタンをクリック
    await page.getByRole('button', { name: '許可' }).click();

    await expect(dialog).not.toBeVisible({ timeout: 3000 });

    // ページをリロード
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // ダイアログが表示されないことを確認（許可が記憶されている）
    await expect(page.getByRole('dialog')).toBeHidden();

    // BGMコントロールが表示されることを確認
    await expect(page.getByRole('button', { name: 'BGM設定' })).toBeVisible({ timeout: 3000 });
  });

  test('should have clickable play/pause button with correct aria-label', async ({ page }) => {
    // ページが読み込まれるまで待機
    await page.waitForLoadState('domcontentloaded');

    // 許可ダイアログで許可を選択
    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: '許可' }).click();

    await expect(dialog).not.toBeVisible({ timeout: 3000 });

    // 再生/一時停止ボタンを取得
    const playPauseButton = page.getByRole('button', { name: /BGMを/ });

    await expect(playPauseButton).toBeVisible({ timeout: 3000 });

    // BGMが自動再生されるまで待機（音声ファイルの読み込み完了を待つ）
    await expect(playPauseButton).toHaveAttribute('aria-label', /BGMを(再生|一時停止)/, { timeout: 5000 });

    // 初期のaria-labelを取得
    const initialLabel = await playPauseButton.getAttribute('aria-label');
    console.warn('Initial button label:', initialLabel);

    // ボタンがクリック可能であることを確認
    await expect(playPauseButton).toBeEnabled();

    // ボタンをクリック
    await playPauseButton.click();

    // ボタンが適切なaria-labelを持っていることを確認
    await expect(playPauseButton).toHaveAttribute('aria-label', /BGMを(再生|一時停止)/, { timeout: 3000 });

    // 最終的なaria-labelを確認
    const finalLabel = await playPauseButton.getAttribute('aria-label');
    console.warn('Final button label:', finalLabel);

    expect(finalLabel).toMatch(/BGMを(再生|一時停止)/);
  });
});
