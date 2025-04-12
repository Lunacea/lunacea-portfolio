import { describe, expect, it } from 'vitest';
import { getI18nPath } from './Helpers';

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
