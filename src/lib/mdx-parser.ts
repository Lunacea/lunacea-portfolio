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
 */
export function extractTableOfContents(markdown: string): Array<{
  id: string;
  title: string;
  level: number;
}> {
  const lines = markdown.split('\n');
  const toc: Array<{ id: string; title: string; level: number }> = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('#')) {
      const hashCount = trimmedLine.match(/^#+/)?.[0].length || 0;
      if (hashCount >= 1 && hashCount <= 6) {
        const title = trimmedLine.substring(hashCount).trim();
        if (title) {
          // シンプルなID生成
          const id = title
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF-]/g, '')
            .replace(/^-+|-+$/g, '');

          toc.push({
            id,
            title,
            level: hashCount,
          });
        }
      }
    }
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
