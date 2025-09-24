'use client';

import { useEffect } from 'react';

export default function MathRenderer() {
  useEffect(() => {
    // KaTeXの動的インポート
    const loadKaTeX = async () => {
      try {
        // 数式要素が存在する場合のみロード
        const mathElements = document.querySelectorAll('.math-inline, .math-display');
        if (mathElements.length === 0) return;

        await import('katex');
        const katexAutoRender = await import('katex/contrib/auto-render');

        // プレビューコンテンツとブログコンテンツの両方を対象にする
        const targetElements = [
          ...document.querySelectorAll('.blog-content'),
          ...document.querySelectorAll('.prose'),
          ...document.querySelectorAll('[data-math-content]')
        ];

        if (targetElements.length === 0) {
          // フォールバック: 全体を対象にする
          katexAutoRender.default(document.body, {
            delimiters: [
              { left: '$', right: '$', display: false },
              { left: '$$', right: '$$', display: true }
            ],
            throwOnError: false,
            errorColor: '#cc0000',
          });
        } else {
          // 特定の要素のみを対象にする
          targetElements.forEach((element) => {
            katexAutoRender.default(element as HTMLElement, {
              delimiters: [
                { left: '$', right: '$', display: false },
                { left: '$$', right: '$$', display: true }
              ],
              throwOnError: false,
              errorColor: '#cc0000',
            });
          });
        }
      } catch (error) {
        console.error('KaTeX loading error:', error);
      }
    };

    loadKaTeX();
  }, []);

  return null;
}
