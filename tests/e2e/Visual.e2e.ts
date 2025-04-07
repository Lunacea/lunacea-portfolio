import percySnapshot from '@percy/playwright';
import { expect, test } from '@playwright/test';

test.describe('Visual testing', () => {
  test.describe('Static pages', () => {
    test('should take screenshot of the homepage', async ({ page }) => {
      await page.goto('/');

      await expect(
        page.getByRole('heading', { name: 'Boilerplate Code for Your Next.js Project with Tailwind CSS' }),
      ).toBeVisible();

      await percySnapshot(page, 'Homepage');
    });

    test('should take screenshot of the about page', async ({ page }) => {
      await page.goto('/about');

      await expect(
        page.getByRole('link', { name: 'About' }),
      ).toBeVisible();

      await percySnapshot(page, 'About');
    });

    test('should take screenshot of the portfolio page', async ({ page }) => {
      await page.goto('/portfolio');

      await expect(
        page.getByText('ポートフォリオページへようこそ！'),
      ).toBeVisible();

      await percySnapshot(page, 'Portfolio');
    });

    test('should take screenshot of the portfolio details page', async ({ page }) => {
      await page.goto('/portfolio');

      await page.getByRole('link', { name: 'Portfolio 2' }).click();

      await expect(
        page.getByText('企業イベント向けのプロモーション'),
      ).toBeVisible();

      await percySnapshot(page, 'Portfolio details');
    });

    test('should take screenshot of the English homepage', async ({ page }) => {
      await page.goto('/en');

      await expect(
        page.getByRole('heading', { name: 'Boilerplate Code for Your Next.js Project with Tailwind CSS' }),
      ).toBeVisible();

      await percySnapshot(page, 'Homepage - English');
    });
  });
});
