'use client';

/**
 * クライアントサイドでのMDX変換用の実装
 * テスト記事の高度な機能に対応
 */
import { replaceFencesWithPlaceholders } from '@/shared/libs/mermaid/core';

export function parseMarkdownToHtml(content: string): string {
  if (!content || typeof content !== 'string') {
    return '<p class="text-muted-foreground">コンテンツがありません</p>';
  }

  if (content.trim().length === 0) {
    return '<p class="text-muted-foreground">コンテンツが空です</p>';
  }

  try {
    let html = content;

    // 1. Mermaid図表の処理（先に置換してコードブロックに食われないように）
    html = replaceFencesWithPlaceholders(html);

    // 2. コードブロックの処理
    html = html.replace(/```(\w+)?(?: title="([^"]*)")?\n([\s\S]*?)```/g, (_m, lang, title, code) => {
      const language = lang || 'plaintext';
      const titleAttr = title ? ` data-title="${title}"` : '';
      return `<pre class="bg-muted rounded-lg p-4 overflow-x-auto my-4"${titleAttr}><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // 3. 見出しの処理
    html = html.replace(/^###### (.*$)/gim, '<h6 class="text-sm font-semibold mt-4 mb-2">$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5 class="text-base font-semibold mt-5 mb-2">$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold mt-6 mb-3">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-6">$1</h1>');

    // 4. 水平線
    html = html.replace(/^---$/gim, '<hr class="my-8 border-border">');

    // 5. 引用
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/30 italic">$1</blockquote>');

    // 6. チェックリスト
    html = html.replace(/^- \[x\] (.*$)/gim, '<li class="flex items-center ml-4 my-1"><input type="checkbox" checked disabled class="mr-2">$1</li>');
    html = html.replace(/^- \[ \] (.*$)/gim, '<li class="flex items-center ml-4 my-1"><input type="checkbox" disabled class="mr-2">$1</li>');

    // 7. 順序付きリスト
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 my-1">$2</li>');
    html = html.replace(/(<li class="ml-4 my-1">.*<\/li>)/g, () => {
      const items = html.match(/<li class="ml-4 my-1">.*?<\/li>/g) || [];
      return `<ol class="list-decimal list-inside my-4 space-y-1">${items.join('')}</ol>`;
    });

    // 8. 順序なしリスト
    html = html.replace(/^[-*] (.*$)/gim, '<li class="ml-4 my-1">$1</li>');
    html = html.replace(/(<li class="ml-4 my-1">.*<\/li>)/g, () => {
      const items = html.match(/<li class="ml-4 my-1">.*?<\/li>/g) || [];
      return `<ul class="list-disc list-inside my-4 space-y-1">${items.join('')}</ul>`;
    });

    // 9. テーブル
    html = html.replace(/\|(.+)\|\n\|[-\s|]+\|\n((?:\|.+\|\n?)*)/g, (_m, header, rows) => {
      const headerCells: string[] = header.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell);
      const rowLines: string[] = rows.trim().split('\n').filter((line: string) => line.trim());
      
      let tableHtml = '<div class="overflow-x-auto my-6"><table class="min-w-full border-collapse border border-border">';
      
      // ヘッダー
      tableHtml += '<thead><tr class="bg-muted">';
      headerCells.forEach((cell: string) => {
        tableHtml += `<th class="border border-border px-4 py-2 text-left font-semibold">${cell}</th>`;
      });
      tableHtml += '</tr></thead>';
      
      // ボディ
      tableHtml += '<tbody>';
      rowLines.forEach((line: string) => {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
        if (cells.length > 0) {
          tableHtml += '<tr>';
          cells.forEach((cell: string) => {
            tableHtml += `<td class="border border-border px-4 py-2">${cell}</td>`;
          });
          tableHtml += '</tr>';
        }
      });
      tableHtml += '</tbody></table></div>';
      
      return tableHtml;
    });

    // 10. インラインスタイル
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

    // 11. リンク
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => {
      const isExternal = url.startsWith('http');
      const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${url}" class="text-primary hover:underline"${target}>${text}</a>`;
    });

    // 12. 数式（LaTeX）- KaTeX用のクラスを追加
    html = html.replace(/\$\$(.*?)\$\$/g, '<div class="my-4 text-center"><span class="math-display katex-display">$$$1$$</span></div>');
    html = html.replace(/\$(.*?)\$/g, '<span class="math-inline katex-inline">$$1$</span>');

    // 13. JSXコンポーネントの簡易処理
    html = html.replace(/<Image\s+([^>]*?)\/>/g, (_m, attrs) => {
      const srcMatch = attrs.match(/src="([^"]*)"/);
      const altMatch = attrs.match(/alt="([^"]*)"/);
      const widthMatch = attrs.match(/width=\{([^}]*)\}/);
      const heightMatch = attrs.match(/height=\{([^}]*)\}/);
      
      const src = srcMatch ? srcMatch[1] : '';
      const alt = altMatch ? altMatch[1] : '';
      const width = widthMatch ? widthMatch[1] : '600';
      const height = heightMatch ? heightMatch[1] : '400';
      
      return `<div class="my-6 text-center">
        <img src="${src}" alt="${alt}" width="${width}" height="${height}" class="max-w-full h-auto rounded-lg border border-border" />
        <p class="text-sm text-muted-foreground mt-2">${alt}</p>
      </div>`;
    });

    // 14. カスタムJSXコンポーネントの処理
    html = html.replace(/<div className="([^"]*)"[^>]*>([\s\S]*?)<\/div>/g, (_m, className, content) => {
      return `<div class="${className}">${content}</div>`;
    });

    // 15. 段落の処理
    html = html.replace(/\n\n/g, '</p><p class="my-4 leading-relaxed">');
    html = `<p class="my-4 leading-relaxed">${html}</p>`;

    // 16. 改行
    html = html.replace(/\n/g, '<br>');

    // 17. 空の段落を削除
    html = html.replace(/<p class="my-4 leading-relaxed"><br><\/p>/g, '');

    return html;
  } catch (error) {
    console.error('Client-side Markdown conversion error:', error);
    return `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <h3 class="text-red-800 font-semibold mb-2">変換エラー</h3>
        <p class="text-red-700 text-sm mb-2">Markdownの変換に失敗しました</p>
        <details class="text-red-600 text-xs">
          <summary class="cursor-pointer">元のコンテンツを表示</summary>
          <pre class="mt-2 whitespace-pre-wrap bg-red-100 p-2 rounded">${content}</pre>
        </details>
      </div>
    `;
  }
}

/**
 * HTMLエスケープ関数
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * テーブルオブコンテンツを抽出（クライアントサイド用）
 */
export function extractTableOfContentsFromMarkdown(content: string): Array<{ id: string; title: string; level: number }> {
  const lines = content.split('\n');
  const toc: Array<{ id: string; title: string; level: number }> = [];
  let inCodeBlock = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // コードブロックの処理
    if (trimmedLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) {
      continue;
    }
    
    // 見出しの処理
    if (trimmedLine.startsWith('#')) {
      const backtickCount = (line.match(/`/g) || []).length;
      const isInInlineCode = backtickCount > 0 && backtickCount % 2 !== 0;
      
      if (!isInInlineCode) {
        const hashMatch = trimmedLine.match(/^(#{1,6})\s(.+)$/);
        if (hashMatch && hashMatch[1] && hashMatch[2]) {
          const hashCount = hashMatch[1].length;
          const title = hashMatch[2].trim();
          
          if (title) {
            const cleanTitle = title
              .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
              .replace(/`([^`]+)`/g, '$1')
              .replace(/\*\*([^*]+)\*\*/g, '$1')
              .replace(/\*([^*]+)\*/g, '$1')
              .replace(/~~([^~]+)~~/g, '$1')
              .trim();
              
            if (cleanTitle) {
              const id = cleanTitle
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-]/g, '')
                .replace(/-+/g, '-')
                .replace(/^-+|-+$/g, '')
                .substring(0, 50);
                
              if (id) {
                toc.push({ id, title: cleanTitle, level: hashCount });
              }
            }
          }
        }
      }
    }
  }
  
  return toc;
}
