'use client';

import { useEffect, useCallback } from 'react';
import { type MermaidTheme } from './useMermaid';

/**
 * テーマ変更を監視するカスタムフック
 * next-themesとの互換性を考慮した実装
 */
export function useThemeObserver(onThemeChange: (theme: MermaidTheme) => void) {
  const getCurrentTheme = useCallback((): MermaidTheme => {
    // next-themesは複数の方法でテーマを管理するため、複数の方法でチェック
    const htmlElement = document.documentElement;
    
    // 1. class属性でチェック
    if (htmlElement.classList.contains('dark')) {
      return 'dark';
    }
    
    // 2. data-theme属性でチェック
    const dataTheme = htmlElement.getAttribute('data-theme');
    if (dataTheme === 'dark') {
      return 'dark';
    }
    
    // 3. デフォルトはライト
    return 'light';
  }, []);

  useEffect(() => {
    let lastTheme = getCurrentTheme();
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as HTMLElement;
          if (target === document.documentElement) {
            const newTheme = getCurrentTheme();
            if (newTheme !== lastTheme) {
              lastTheme = newTheme;
              // 少し遅延させてテーマ変更が完全に適用されるのを待つ
              setTimeout(() => {
                onThemeChange(newTheme);
              }, 50);
            }
          }
        }
      });
    });

    // class属性とdata-theme属性の両方を監視
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    return () => {
      observer.disconnect();
    };
  }, [getCurrentTheme, onThemeChange]);
}
