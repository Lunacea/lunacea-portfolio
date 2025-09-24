import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode, { type Options } from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkToc from 'remark-toc';
import { unified } from 'unified';

const prettyOptions: Options = {
  theme: { dark: 'github-dark', light: 'github-light' },
  keepBackground: false,
  grid: false,
  defaultLang: { block: 'plaintext', inline: 'plaintext' },
};

export function createMdxProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkToc, { heading: '目次|Table of Contents|TOC|toc', maxDepth: 3 })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['anchor-link'] } })
    .use(rehypeKatex)
    .use(rehypePrettyCode, prettyOptions)
    .use(rehypeStringify, { allowDangerousHtml: true });
}


