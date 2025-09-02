import { serialize } from 'next-mdx-remote/serialize';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode, { type Options } from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkToc from 'remark-toc';
import { unified } from 'unified';
import { logger } from '@/shared/libs/Logger';
import 'server-only';

const rehypePrettyCodeOptions: Options = {
  theme: { dark: 'github-dark', light: 'github-light' },
  keepBackground: false,
  grid: false,
  defaultLang: { block: 'plaintext', inline: 'plaintext' },
};

// MDXをHTMLに変換するプロセッサー
const mdxToHtmlProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkToc, { heading: '目次|Table of Contents|TOC|toc', maxDepth: 3 })
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['anchor-link'] } })
  .use(rehypePrettyCode, rehypePrettyCodeOptions)
  .use(rehypeStringify, { allowDangerousHtml: true });

/**
 * MDXコンテンツをHTMLに変換
 * JSXコンポーネントは基本的なHTMLに変換される
 */
export async function parseMDXToHtml(content: string): Promise<string> {
  try {
    // Mermaidコンポーネントを正規表現で前処理
    let processedContent = content;
    
    // 1. ```mermaid```コードブロックを<MermaidDiagram>タグに変換
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
    
    // 2. <MermaidDiagram>タグをプレースホルダーに変換
    const mermaidMatches = processedContent.match(/<MermaidDiagram>([\s\S]*?)<\/MermaidDiagram>/g);
    
    if (mermaidMatches) {
      mermaidMatches.forEach((match) => {
        // Mermaidコンポーネントの内容を抽出
        const contentMatch = match.match(/<MermaidDiagram>([\s\S]*?)<\/MermaidDiagram>/);
        if (contentMatch && contentMatch[1]) {
          const mermaidContent = contentMatch[1].trim();
          // 属性値を安全にエンコード（HTML属性内での使用を考慮）
          const encodedContent = encodeURIComponent(mermaidContent);
          // HTML属性内でのエスケープを追加
          const escapedContent = encodedContent.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
          const placeholder = `<div class="mermaid-placeholder" data-mermaid-content="${escapedContent}">Mermaid図表をレンダリング中...</div>`;
          processedContent = processedContent.replace(match, placeholder);
        }
      });
    }
    
    const result = await mdxToHtmlProcessor.process(processedContent);
    const htmlContent = String(result);
    
    return htmlContent;
  } catch (error) {
    logger.error({ error, content: content.substring(0, 200) }, 'MDX to HTML conversion error');
    return `<pre class="error-fallback">MDX変換エラー: ${content}</pre>`;
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
    // ```mermaid```コードブロックを<MermaidDiagram>タグに変換
    let processedContent = content;
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
          remarkToc,
        ],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['anchor-link'] } }],
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
