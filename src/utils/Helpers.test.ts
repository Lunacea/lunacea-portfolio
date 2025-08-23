import { describe, expect, it, vi } from 'vitest';
import { getI18nPath } from '@/shared/utils/Helpers';

// next-intl -> next/navigation の依存を避けるため局所モック（hoistでインポートより前に適用）
const mockedI18n = vi.hoisted(() => ({
  routing: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    localePrefix: 'as-needed',
  },
}));
vi.mock('@/shared/libs/i18nNavigation', () => mockedI18n);

describe('Helpers', () => {
  describe('getI18nPath function', () => {
    it('should not change the path for default language', () => {
      const url = '/about';
      const locale = 'ja'; // デフォルト言語

      expect(getI18nPath(url, locale)).toBe(url);
    });

    it('should prepend the locale to the path for non-default language', () => {
      const url = '/about';
      const locale = 'en'; // 非デフォルト言語

      expect(getI18nPath(url, locale)).toMatch(/^\/en/);
    });
  });
});
