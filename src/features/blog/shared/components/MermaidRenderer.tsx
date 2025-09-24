'use client';

import { useEffect } from 'react';
import { findMermaidTargets, pickMermaidContent } from '@/shared/libs/mermaid';

// URIデコードの安全版（エンコード済みでない文字列に対して例外を投げない）
function safeDecodeURIComponent(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

export default function MermaidRenderer() {
  useEffect(() => {
    const renderMermaid = async () => {
      try {
        const scope: ParentNode = document.querySelector('.blog-content') || document;
        const mermaidElements = findMermaidTargets(scope);
        
        // デバッグログは削除
        
        // フォールバック: .mermaid-placeholder要素にdata-mermaid-content属性がない場合
        // 元のMarkdownコンテンツから直接Mermaid図表を検出してレンダリング
        const placeholderElements = document.querySelectorAll('.mermaid-placeholder');
        const elementsWithoutData = Array.from(placeholderElements).filter(el => !el.hasAttribute('data-mermaid-content'));
        
        if (elementsWithoutData.length > 0) {
          // ページ内のMarkdownコンテンツを検索
          const markdownContent = document.querySelector('[data-markdown-content]')?.textContent || 
                                 document.querySelector('.blog-content')?.textContent || '';
          
          if (markdownContent.includes('```mermaid')) {
            // CRLFやオプションの空白行に対応
            const mermaidBlocks = markdownContent.match(/```mermaid[^\n]*\r?\n([\s\S]*?)\r?\n```/g);
            if (mermaidBlocks) {
              mermaidBlocks.forEach((block, index) => {
                const contentMatch = block.match(/```mermaid[^\n]*\r?\n([\s\S]*?)\r?\n```/);
                if (contentMatch && contentMatch[1] && elementsWithoutData[index]) {
                  const mermaidContent = contentMatch[1].trim();
                  const element = elementsWithoutData[index];
                  
                  // data-mermaid-content属性を設定
                  element.setAttribute('data-mermaid-content', encodeURIComponent(mermaidContent));                  
                }
              });
            }
          }
        }

        // 既にレンダリング済みのmermaid図は除外
        const unrenderedElements = mermaidElements.filter(element => {
          // SVGが既に含まれている場合はスキップ
          if (element.querySelector('svg')) return false;
          // 既に描画済みフラグがある場合はスキップ
          if ((element as HTMLElement).dataset.mermaidRendered === 'true') return false;
          // mermaid-diagramクラスが既に適用されている場合はスキップ
          if (element.classList.contains('mermaid-diagram')) return false;
          return true;
        });

        
        if (unrenderedElements.length === 0) return;

        const mermaid = await import('mermaid');

        // テーマに応じて初期化
        const getTheme = () => document.documentElement.classList.contains('dark') ? 'dark' : 'default';
        const initMermaid = () => {
          mermaid.default.initialize({
            startOnLoad: false,
            theme: getTheme(),
            securityLevel: 'loose',
            fontFamily: 'inherit',
          });
        };
        initMermaid();

        // IO + 同時実行制限で描画
        const maxConcurrent = 2;
        let active = 0;
        const queue: Element[] = [];

        const schedule = (el: Element) => {
          queue.push(el);
          pump();
        };

        const pump = () => {
          while (active < maxConcurrent && queue.length > 0) {
            const el = queue.shift();
            if (!el) return;
            active++;
            void renderOne(el).finally(() => {
              active--;
              pump();
            });
          }
        };

        const renderOne = async (element: Element) => {
          let content = '';
          
          // 要素の種類に応じてコンテンツを取得
          content = pickMermaidContent(element);
          
          if (!content) return;

          // デバッグログは削除

          try {
            // プレースホルダーにはURIエンコード済みのdata-mermaid-contentが入る想定
            // それ以外のコードブロック等は生文字列のためdecodeしない
            const shouldDecode = element.classList.contains('mermaid-placeholder');
            const decodedContent = shouldDecode ? safeDecodeURIComponent(content) : content;
            const encodedContent = shouldDecode ? content : encodeURIComponent(content);
            
            // デバッグログは削除
            
            const { svg } = await mermaid.default.render(`mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`, decodedContent);
            
            // 要素をSVGに置き換え
            if (element.classList.contains('mermaid-placeholder')) {
              // スケルトンを表示し、その後SVGに置換
              const skeleton = document.createElement('div');
              skeleton.className = 'my-4 border border-border rounded-lg bg-muted/30 p-4 animate-pulse';
              skeleton.innerHTML = `
                <div class="h-4 bg-muted rounded w-1/3 mb-3"></div>
                <div class="h-40 bg-muted rounded w-full"></div>
              `;
              element.replaceChildren(skeleton);
              element.innerHTML = svg;
              element.className = 'mermaid-diagram my-4';
              (element as HTMLElement).dataset.mermaidRendered = 'true';
              // 元コンテンツを保持（テーマ再描画用）
              (element as HTMLElement).setAttribute('data-mermaid-content', encodedContent);
              
            } else {
              // コードブロックの場合は、親要素を置き換え
              const container = document.createElement('div');
              container.className = 'mermaid-diagram my-4';
              container.innerHTML = svg;
              element.parentNode?.replaceChild(container, element);
              (container as HTMLElement).dataset.mermaidRendered = 'true';
              (container as HTMLElement).setAttribute('data-mermaid-content', encodedContent);
              
            }
          } catch (error) {
            console.error('Mermaid rendering error:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'bg-red-50 border border-red-200 rounded-lg p-4';
            errorDiv.innerHTML = `
              <p class="text-red-700 text-sm">Mermaid図表のレンダリングに失敗しました</p>
              <details class="text-red-600 text-xs mt-2">
                <summary class="cursor-pointer">エラー詳細</summary>
                <pre class="mt-2 whitespace-pre-wrap bg-red-100 p-2 rounded">${error}</pre>
              </details>
            `;
            element.parentNode?.replaceChild(errorDiv, element);
          }
        };

        const io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              io.unobserve(entry.target);
              schedule(entry.target);
            }
          });
        }, { root: null, rootMargin: '200px 0px', threshold: 0.01 });

        unrenderedElements.forEach(el => io.observe(el));

        // テーマ変更監視: <html>のclass変化で再描画
        const rerenderAll = async () => {
          initMermaid();
          const scopeNode: ParentNode = document.querySelector('.blog-content') || document;
          const diagrams = scopeNode.querySelectorAll('.mermaid-diagram');
          for (const el of Array.from(diagrams)) {
            const raw = (el as HTMLElement).getAttribute('data-mermaid-content');
            if (!raw) continue;
            const decoded = safeDecodeURIComponent(raw);
            try {
              const { svg } = await mermaid.default.render(`mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`, decoded);
              (el as HTMLElement).innerHTML = svg;
            } catch {
              // no-op
            }
          }
        };
        const htmlEl = document.documentElement;
        let lastTheme = getTheme();
        const mo = new MutationObserver(() => {
          const nextTheme = getTheme();
          if (nextTheme !== lastTheme) {
            lastTheme = nextTheme;
            void rerenderAll();
          }
        });
        mo.observe(htmlEl, { attributes: true, attributeFilter: ['class'] });
      } catch (error) {
        console.error('Mermaid loading error:', error);
      }
    };

    // DOMの準備を待ってレンダリングを実行
    const timeoutId = setTimeout(renderMermaid, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return null;
}