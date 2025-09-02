import { Page, expect } from '@playwright/test';

/**
 * UserConsentModalを閉じるヘルパー関数
 */
export async function closeUserConsentModal(page: Page): Promise<void> {
  const modal = page.locator('.modalRoot.visibleState');
  
  if (await modal.count() > 0) {
    // OFFボタンをクリックしてモーダルを閉じる
    await page.getByRole('button', { name: 'OFF' }).click();
    
    // モーダルが完全に閉じるまで待機
    await expect(modal).not.toBeVisible({ timeout: 5000 });
    
    // 追加の待機時間
    await page.waitForTimeout(1000);
  }
}

/**
 * ページをクリーンな状態で読み込むヘルパー関数
 */
export async function loadPageClean(page: Page, url: string): Promise<void> {
  // ページを先に読み込む
  await page.goto(url);
  await page.waitForLoadState('domcontentloaded');
  
  // localStorageとsessionStorageをクリア
  await page.evaluate(() => {
    localStorage.removeItem('bgmUserConsent');
    localStorage.removeItem('bgm-permission');
    localStorage.removeItem('bgm-volume');
    localStorage.removeItem('bgm-muted');
    sessionStorage.removeItem('visitedAnyRoute');
  });
  
  // ページをリロード
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  
  // モーダルを閉じる
  await closeUserConsentModal(page);
}
