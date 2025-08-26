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

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkToc, { heading: '目次|Table of Contents|TOC|toc', maxDepth: 3 })
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['anchor-link'] } })
  .use(rehypePrettyCode, rehypePrettyCodeOptions)
  .use(rehypeStringify, { allowDangerousHtml: true });

export async function parseMarkdownToHtml(markdown: string): Promise<string> {
  try {
    const result = await processor.process(markdown);
    return String(result);
  } catch (error) {
    logger.error({ error }, 'Markdown parsing error');
    return `<pre class="error-fallback">${markdown}</pre>`;
  }
}

export function extractTableOfContents(markdown: string): Array<{ id: string; title: string; level: number }> {
  const lines = markdown.split('\n');
  const toc: Array<{ id: string; title: string; level: number }> = [];
  let inCodeBlock = false;
  let inFrontMatter = false;
  let lineIndex = 0;
  for (const line of lines) {
    const trimmedLine = line.trim();
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
    if (trimmedLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      lineIndex++;
      continue;
    }
    if (inCodeBlock) {
      lineIndex++;
      continue;
    }
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
