import type { Options } from 'rehype-pretty-code';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkToc from 'remark-toc';
import { unified } from 'unified';
import 'server-only';

// 統一されたrehype-pretty-codeオプション
const rehypePrettyCodeOptions: Options = {
  theme: {
    dark: 'github-dark',
    light: 'github-light',
  },
  keepBackground: false,
  grid: false,
  defaultLang: {
    block: 'plaintext',
    inline: 'plaintext',
  },
};

// 統一されたMDXプロセッサー
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkToc, {
    heading: '目次|Table of Contents|TOC|toc',
    maxDepth: 3,
  })
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, {
    behavior: 'wrap',
    properties: {
      className: ['anchor-link'],
    },
  })
  .use(rehypePrettyCode, rehypePrettyCodeOptions)
  .use(rehypeStringify, { allowDangerousHtml: true });

/**
 * MarkdownをHTMLに変換（統一された処理）
 */
export async function parseMarkdownToHtml(markdown: string): Promise<string> {
  try {
    const result = await processor.process(markdown);
    return String(result);
  } catch (error) {
    console.error('Markdown parsing error:', error);
    return `<pre class="error-fallback">${markdown}</pre>`;
  }
}

/**
 * MDXコンテンツから目次を抽出
 * - コードブロック内の#は除外
 * - Front matterを除外
 * - インラインコードブロック内の#は除外
 * - 適切な見出しのみを抽出
 */
export function extractTableOfContents(markdown: string): Array<{
  id: string;
  title: string;
  level: number;
}> {
  const lines = markdown.split('\n');
  const toc: Array<{ id: string; title: string; level: number }> = [];

  let inCodeBlock = false;
  let inFrontMatter = false;
  let lineIndex = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Front matterの処理（ファイルの最初の---から次の---まで）
    if (lineIndex === 0 && trimmedLine === '---') {
      inFrontMatter = true;
      lineIndex++;
      continue;
    }

    if (inFrontMatter && trimmedLine === '---') {
      inFrontMatter = false;
      lineIndex++;
      continue;
    }

    if (inFrontMatter) {
      lineIndex++;
      continue;
    }

    // コードブロックの開始・終了を検出
    if (trimmedLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      lineIndex++;
      continue;
    }

    // コードブロック内は無視
    if (inCodeBlock) {
      lineIndex++;
      continue;
    }

    // 見出しの検出（#で始まる行）
    if (trimmedLine.startsWith('#')) {
      // インラインコードブロック内の#をチェック
      const backtickCount = (line.match(/`/g) || []).length;
      const isInInlineCode = backtickCount > 0 && backtickCount % 2 !== 0;

      if (!isInInlineCode) {
        const hashMatch = trimmedLine.match(/^(#{1,6})\s(.+)$/);
        if (hashMatch && hashMatch[1] && hashMatch[2]) {
          const hashCount = hashMatch[1].length;
          const title = hashMatch[2].trim();

          // 空のタイトルは除外
          if (title && title.length > 0) {
            // タイトルから余分な記号を除去（リンクやコードの記号など）
            const cleanTitle = title
              .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // マークダウンリンクを削除
              .replace(/`([^`]+)`/g, '$1') // インラインコードのバッククォートを削除
              .replace(/\*\*([^*]+)\*\*/g, '$1') // 太字記号を削除
              .replace(/\*([^*]+)\*/g, '$1') // 斜体記号を削除
              .replace(/~~([^~]+)~~/g, '$1') // 取り消し線を削除
              .trim();

            if (cleanTitle && cleanTitle.length > 0) {
              // より厳密なID生成（日本語対応、記号の適切な処理）
              const id = cleanTitle
                .toLowerCase()
                .replace(/\s+/g, '-') // スペースをハイフンに
                .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\-]/g, '') // 英数字、ひらがな、カタカナ、漢字、ハイフンのみ残す
                .replace(/-+/g, '-') // 連続するハイフンを1つに
                .replace(/^-+|-+$/g, '') // 先頭末尾のハイフンを削除
                .substring(0, 50); // 長すぎる場合は切り詰め

              if (id) {
                toc.push({
                  id,
                  title: cleanTitle,
                  level: hashCount,
                });
              }
            }
          }
        }
      }
    }

    lineIndex++;
  }

  return toc;
}

/**
 * Mermaid図表のプレビュー処理
 */
export function processMermaidDiagrams(html: string): string {
  // Mermaid図表を検出してプレースホルダーに置換
  const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;

  return html.replace(mermaidRegex, (_match, diagram) => {
    const diagramId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
    return `
      <div class="mermaid-container">
        <div id="${diagramId}" class="mermaid-diagram" data-diagram="${encodeURIComponent(diagram.trim())}">
          <div class="mermaid-placeholder">
            <div class="flex items-center justify-center p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
              <div class="text-center">
                <div class="text-primary text-2xl mb-2">📊</div>
                <div class="text-theme-primary font-medium">Mermaid Diagram</div>
                <div class="text-theme-secondary text-sm mt-1">インタラクティブ図表</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}
