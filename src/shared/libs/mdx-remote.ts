import { serialize } from 'next-mdx-remote/serialize';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode, { type Options } from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
// rehypeStringify は pipeline 側で使用
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
// remarkParse/remarkRehype は pipeline 側で使用
import remarkToc from 'remark-toc';
// unified は pipeline 側で使用
import { replaceFencesWithPlaceholders } from '@/shared/libs/mermaid/core';
import { createMdxProcessor } from '@/shared/libs/mdx/pipeline';
import { logger } from '@/shared/libs/Logger';
import 'server-only';

const rehypePrettyCodeOptions: Options = {
  theme: { dark: 'github-dark', light: 'github-light' },
  keepBackground: false,
  grid: false,
  defaultLang: { block: 'plaintext', inline: 'plaintext' },
};

// MDXをHTMLに変換するプロセッサー（共通）
const mdxToHtmlProcessor = createMdxProcessor();

/**
 * MDXコンテンツをHTMLに変換
 * JSXコンポーネントは基本的なHTMLに変換される
 */
export async function parseMDXToHtml(content: string): Promise<string> {
  // 入力検証
  if (!content || typeof content !== 'string') {
    logger.warn({ content }, 'Invalid content provided to parseMDXToHtml');
    return '<p class="text-muted-foreground">コンテンツがありません</p>';
  }

  // 空のコンテンツの場合
  if (content.trim().length === 0) {
    return '<p class="text-muted-foreground">コンテンツが空です</p>';
  }

  try {
    // MDXカスタムボックスとMermaid図表を正規表現で前処理
    let processedContent = content;
    
    // 1. MDXカスタムボックス（JSXコンポーネント）をHTMLに変換
    // より包括的なJSXコンポーネントの処理
    const jsxPatterns = [
      /<div\s+className="[^"]*"[^>]*>[\s\S]*?<\/div>/g,  // div要素
      /<span\s+className="[^"]*"[^>]*>[\s\S]*?<\/span>/g, // span要素
      /<h[1-6]\s+className="[^"]*"[^>]*>[\s\S]*?<\/h[1-6]>/g, // 見出し要素
      /<p\s+className="[^"]*"[^>]*>[\s\S]*?<\/p>/g, // p要素
    ];
    
    jsxPatterns.forEach(pattern => {
      const jsxMatches = processedContent.match(pattern);
      if (jsxMatches) {
        jsxMatches.forEach((jsxElement) => {
          // JSXのclassNameをclassに変換し、JSXの式を展開
          const htmlElement = jsxElement
            .replace(/className=/g, 'class=')
            .replace(/\{([^}]+)\}/g, '$1') // JSXの式を展開
            .replace(/\s+/g, ' ') // 余分な空白を削除
            .trim();
          
          processedContent = processedContent.replace(jsxElement, htmlElement);
        });
      }
    });
    
    // 2-3. mermaidフェンスをスケルトンプレースホルダーへ（共通ロジック）
    processedContent = replaceFencesWithPlaceholders(processedContent);
    
    // MDX処理の実行
    const result = await mdxToHtmlProcessor.process(processedContent);
    const htmlContent = String(result);
    
    // 結果の検証
    if (!htmlContent || htmlContent.trim().length === 0) {
      logger.warn({ content: content.substring(0, 200) }, 'Empty HTML result from MDX processing');
      return '<p class="text-muted-foreground">コンテンツの変換に失敗しました</p>';
    }
    
    return htmlContent;
  } catch (error) {
    logger.error({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      content: content.substring(0, 200) 
    }, 'MDX to HTML conversion error');
    
    // より詳細なエラーメッセージを提供
    const errorMessage = error instanceof Error ? error.message : '不明なエラー';
    return `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <h3 class="text-red-800 font-semibold mb-2">MDX変換エラー</h3>
        <p class="text-red-700 text-sm mb-2">${errorMessage}</p>
        <details class="text-red-600 text-xs">
          <summary class="cursor-pointer">元のコンテンツを表示</summary>
          <pre class="mt-2 whitespace-pre-wrap bg-red-100 p-2 rounded">${content}</pre>
        </details>
      </div>
    `;
  }
}

/**
 * MDXコンテンツをnext-mdx-remoteでシリアライズ
 * JSXコンポーネントの埋め込みに対応
 */
export async function serializeMDXContent(content: string): Promise<{
  compiledSource: string;
  frontmatter: Record<string, unknown>;
  scope: Record<string, unknown>;
}> {
  try {
    // MDXカスタムボックスとMermaid図表を正規表現で前処理
    let processedContent = content;
    
    // 1. MDXカスタムボックス（JSXコンポーネント）をHTMLに変換
    const jsxPatterns = [
      /<div\s+className="[^"]*"[^>]*>[\s\S]*?<\/div>/g,  // div要素
      /<span\s+className="[^"]*"[^>]*>[\s\S]*?<\/span>/g, // span要素
      /<h[1-6]\s+className="[^"]*"[^>]*>[\s\S]*?<\/h[1-6]>/g, // 見出し要素
      /<p\s+className="[^"]*"[^>]*>[\s\S]*?<\/p>/g, // p要素
    ];
    
    jsxPatterns.forEach(pattern => {
      const jsxMatches = processedContent.match(pattern);
      if (jsxMatches) {
        jsxMatches.forEach((jsxElement) => {
          // JSXのclassNameをclassに変換し、JSXの式を展開
          const htmlElement = jsxElement
            .replace(/className=/g, 'class=')
            .replace(/\{([^}]+)\}/g, '$1') // JSXの式を展開
            .replace(/\s+/g, ' ') // 余分な空白を削除
            .trim();
          
          processedContent = processedContent.replace(jsxElement, htmlElement);
        });
      }
    });
    
    // 2. ```mermaid```コードブロックを<MermaidDiagram>タグに変換
    const mermaidCodeBlocks = content.match(/```mermaid\n([\s\S]*?)\n```/g);
    if (mermaidCodeBlocks) {
      mermaidCodeBlocks.forEach((codeBlock) => {
        const contentMatch = codeBlock.match(/```mermaid\n([\s\S]*?)\n```/);
        if (contentMatch && contentMatch[1]) {
          const mermaidContent = contentMatch[1].trim();
          const mermaidTag = `<MermaidDiagram>${mermaidContent}</MermaidDiagram>`;
          processedContent = processedContent.replace(codeBlock, mermaidTag);
        }
      });
    }
    
    const serialized = await serialize(processedContent, {
      mdxOptions: {
        remarkPlugins: [
          remarkGfm,
          [remarkMath, { singleDollarTextMath: false }],
          remarkToc,
        ],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['anchor-link'] } }],
          rehypeKatex,
          [rehypePrettyCode, rehypePrettyCodeOptions],
        ],
        format: 'mdx',
      },
      parseFrontmatter: false, // gray-matterで既に解析済み
    });
    
    return serialized;
  } catch (error) {
    logger.error({ error, content: content.substring(0, 200) }, 'MDX serialization error');
    throw new Error(`MDX serialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * テーブルオブコンテンツを抽出（MDX用）
 * 既存のextractTableOfContents関数と互換性を保つ
 */
export function extractTableOfContentsFromMDX(content: string): Array<{ id: string; title: string; level: number }> {
  const lines = content.split('\n');
  const toc: Array<{ id: string; title: string; level: number }> = [];
  let inCodeBlock = false;
  let inFrontMatter = false;
  let lineIndex = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Front Matterの処理
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
    
    // コードブロックの処理
    if (trimmedLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      lineIndex++;
      continue;
    }
    if (inCodeBlock) {
      lineIndex++;
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
    lineIndex++;
  }
  
  return toc;
}
