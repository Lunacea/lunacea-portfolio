'use client';

import { useEffect, useCallback } from 'react';
import { useMermaid, type MermaidTheme } from '@/features/blog/hooks/useMermaid';
import { useThemeObserver } from '@/features/blog/hooks/useThemeObserver';

/**
 * HTML内のMermaidプレースホルダーを実際のMermaid図表に変換
 * リファクタリング版：責務分離とカスタムフック活用
 */
export default function MermaidRenderer() {
  const { 
    isInitialized, 
    initializeMermaid, 
    renderDiagram, 
    updateTheme 
  } = useMermaid();

  // テーマ変更の監視
  useThemeObserver(async (theme: MermaidTheme) => {
    if (isInitialized) {
      await updateTheme(theme);
      // テーマ変更後は既存の図表を再レンダリング
      await renderExistingDiagrams();
    }
  });

  const renderExistingDiagrams = useCallback(async () => {
    if (!isInitialized) return;

    // 既存の図表も含めて処理（テーマ変更時は再処理が必要）
    const placeholders = document.querySelectorAll('.mermaid-placeholder, [data-mermaid-content], .mermaid-diagram');
    
    for (const placeholder of placeholders) {
      // テーマ変更時は既存の図表も再処理
      const isExistingDiagram = placeholder.classList.contains('mermaid-diagram');
      if (!isExistingDiagram && placeholder.getAttribute('data-processed') === 'true') {
        continue;
      }
      
      // 既存の図表の場合はプレースホルダーに戻す
      if (isExistingDiagram) {
        const originalContent = placeholder.getAttribute('data-original-content');
        if (originalContent) {
          placeholder.className = 'mermaid-placeholder';
          placeholder.setAttribute('data-mermaid-content', originalContent);
          placeholder.innerHTML = 'Mermaid図表をレンダリング中...';
        }
      }
      
      // 処理済みマークを設定
      placeholder.setAttribute('data-processed', 'true');
      
      // コンテンツを取得
      let content = '';
      const attributes = placeholder.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (attr && attr.name.startsWith('data-mermaid-')) {
          // 属性名が壊れている場合の処理
          if (attr.name.includes('"') && attr.value === '') {
            const match = attr.name.match(/data-mermaid-c"([^"]+)"/);
            if (match && match[1]) {
              const safeDecodeURIComponent = (value: string): string => {
                try { return decodeURIComponent(value); } catch { return value; }
              };
              content = safeDecodeURIComponent(match[1]);
            }
          } else if (attr.value) {
            const unescapedValue = attr.value.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
            const hasValidPercentEscapes = /%(?:[0-9A-Fa-f]{2})/.test(unescapedValue);
            const safeDecodeURIComponent = (value: string): string => {
              try { return decodeURIComponent(value); } catch { return value; }
            };
            content = hasValidPercentEscapes ? safeDecodeURIComponent(unescapedValue) : unescapedValue;
          }
          break;
        }
      }
      
      // 属性が見つからない場合は、親要素からMermaidコンテンツを探す
      if (!content) {
        const parentElement = placeholder.parentElement;
        if (parentElement) {
          const parentText = parentElement.textContent || '';
          const mermaidMatch = parentText.match(/(graph TD|sequenceDiagram|gantt|classDiagram)[\s\S]*?(?=\n\n|\n###|$)/);
          if (mermaidMatch) {
            content = mermaidMatch[0].trim();
          }
        }
      }
      
      if (!content) {
        continue;
      }

      // 安定したID生成（ハイドレーション差分を避ける）
      const containerId = `renderer-${performance.now().toFixed(0)}-${(Math.random() * 1e9).toFixed(0)}`;
      const result = await renderDiagram(content, containerId);
      
      if (result.error) {
        // エラー表示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-100 border border-red-300 rounded-lg p-4 my-6';
        errorDiv.innerHTML = `
          <h4 class="text-red-800 font-semibold mb-2">Mermaid図表のレンダリングエラー</h4>
          <p class="text-red-700 text-sm mb-2">エラー: ${result.error.message}</p>
          <p class="text-red-700 text-sm mb-2">元の構文：</p>
          <pre class="bg-red-50 p-2 rounded text-xs overflow-x-auto mb-2">${result.error.originalContent}</pre>
          <p class="text-red-700 text-sm mb-2">修正後の構文：</p>
          <pre class="bg-red-50 p-2 rounded text-xs overflow-x-auto">${result.error.correctedContent}</pre>
        `;
        placeholder.parentNode?.replaceChild(errorDiv, placeholder);
      } else {
        // SVG表示
        const wrapper = document.createElement('div');
        wrapper.className = 'mermaid-diagram my-6 flex justify-center overflow-auto rounded-2xl border border-border bg-card p-6 shadow-lg';
        wrapper.innerHTML = result.svg;
        wrapper.setAttribute('data-original-content', content);
        placeholder.parentNode?.replaceChild(wrapper, placeholder);
      }
    }
  }, [isInitialized, renderDiagram]);

  useEffect(() => {
    let cancelled = false;
    const initializeAndRender = async () => {
      if (!isInitialized) {
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        await initializeMermaid(currentTheme);
      }

      const schedule = (cb: () => void, delay: number) => setTimeout(cb, delay);
      type RequestIdleCallbackFn = (cb: () => void, opts?: { timeout?: number }) => number;
      const idle = (cb: () => void) => {
        const ric = (window as unknown as { requestIdleCallback?: RequestIdleCallbackFn }).requestIdleCallback;
        if (typeof ric === 'function') return ric(cb, { timeout: 1200 });
        return schedule(cb, 200);
      };

      idle(() => { if (!cancelled) void renderExistingDiagrams(); });
    };

    void initializeAndRender();
    return () => { cancelled = true; };
  }, [isInitialized, initializeMermaid, renderExistingDiagrams]);

  return null; // このコンポーネントは何もレンダリングしない
}
