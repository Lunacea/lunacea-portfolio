import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import Link from 'next/link';
import { describe, expect, it } from 'vitest';
import { BaseTemplate } from './BaseTemplate';

// 翻訳メッセージのモック
const messages = {
  BaseTemplate: {
    description: 'テスト説明',
  },
};

describe('Base template', () => {
  describe('Render method', () => {
    it('should have 3 menu items', () => {
      // Setup
      render(
        <NextIntlClientProvider locale="ja" messages={messages}>
          <BaseTemplate
            leftNav={(
              <>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/portfolio">Portfolio</Link>
                </li>
              </>
            )}
          >
            {null}
          </BaseTemplate>
        </NextIntlClientProvider>,
      );

      // 3つのメニュー項目が表示されることを確認
      const menuItemList = screen.getAllByRole('listitem');

      expect(menuItemList).toHaveLength(3);
    });

    it('should have a link to Lunacea', () => {
      // Setup
      render(
        <NextIntlClientProvider locale="ja" messages={messages}>
          <BaseTemplate leftNav={<></>}>
            {null}
          </BaseTemplate>
        </NextIntlClientProvider>,
      );

      // タイトルテキストを確認
      const title = screen.getByRole('heading', { level: 1 });

      expect(title).toHaveTextContent('Lunacea');
    });
  });
});
