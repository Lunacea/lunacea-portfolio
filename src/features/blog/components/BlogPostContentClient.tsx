'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { replaceFencesWithPlaceholders } from '@/shared/libs/mermaid';
const TableOfContents = dynamic(() => import('@/features/blog/shared/components/TableOfContents'), {
  ssr: false,
  loading: () => null
}) as React.ComponentType<{ items: { id: string; title: string; level: number; }[]; className?: string; }>;
const MermaidRenderer = dynamic(() => import('@/features/blog/shared/components/MermaidRenderer'), { ssr: false, loading: () => null });
const MathRenderer = dynamic(() => import('@/features/blog/shared/components/MathRenderer'), { ssr: false, loading: () => null });
const CodeCopyEnhancer = dynamic(() => import('@/features/blog/shared/components/CodeCopyEnhancer'), { ssr: false, loading: () => null });

type BlogPost = {
  slug: string;
  title: string;
  description?: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  readingTime: string;
  content: string;
  htmlContent?: string;
  tableOfContents?: Array<{ id: string; title: string; level: number }>;
  excerpt?: string;
  isMDX?: boolean;
};

type BlogPostContentClientProps = {
  post: BlogPost;
};

function sanitizeHtmlContent(htmlContent: string): string {
  // サーバーで既にサニタイズ済み。クライアント側ではそのまま使用。
  // ただし、基本的な検証は行う
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }
  return htmlContent;
}

export default function BlogPostContentClient({ post }: BlogPostContentClientProps) {
  // Mermaidブロックをプレースホルダーに置き換えたHTMLコンテンツを生成
  const safeHtmlContent = useMemo(() => {
    let htmlContent = sanitizeHtmlContent(post.htmlContent || '');
    if (!htmlContent && post.content?.includes('```mermaid')) {
      htmlContent = replaceFencesWithPlaceholders(post.content);
    }
    return htmlContent;
  }, [post.htmlContent, post.content]);

  const hasCodeBlocks = useMemo(() => {
    const html = safeHtmlContent;
    return html.includes('<pre') || html.includes('<code');
  }, [safeHtmlContent]);

  const hasMermaid = post.content?.includes('```mermaid') || false;

  const hasMath = useMemo(() => {
    const html = safeHtmlContent;
    return html.includes('math-inline') ||
      html.includes('math-display') ||
      html.includes('katex-inline') ||
      html.includes('katex-display') ||
      html.includes('katex') ||
      html.includes('$$') ||
      html.includes('$');
  }, [safeHtmlContent]);

  const fallbackContent = useMemo(() => {
    if (!safeHtmlContent && post.content) {
      return (
        <div className="bg-muted/50 rounded-2xl p-6 border border-border">
          <p className="text-muted-foreground mb-4 text-sm">コンテンツの生成に失敗しました。元のMarkdownを表示します：</p>
          <pre className="whitespace-pre-wrap text-muted-foreground leading-relaxed font-mono text-sm overflow-x-auto">{post.content}</pre>
        </div>
      );
    }
    return null;
  }, [safeHtmlContent, post.content]);

  return (
    <div>
      <TableOfContents items={post.tableOfContents || []} className="mb-8 lg:hidden" />

      {/* HTMLコンテンツのレンダリング */}
      {safeHtmlContent ? (
        <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-pre:!bg-transparent prose-pre:!p-0 prose-pre:!m-0">
          <div className="blog-content no-wrap-inline-code" dangerouslySetInnerHTML={{ __html: safeHtmlContent }} />
          {hasCodeBlocks ? <CodeCopyEnhancer /> : null}
        </div>
      ) : (
        /* フォールバックコンテンツ */
        <div className="bg-muted/50 rounded-2xl p-6 border border-border">
          <h3 className="text-muted-foreground font-semibold mb-2">コンテンツの読み込みに失敗しました</h3>
          <p className="text-muted-foreground text-sm mb-4">
            記事のコンテンツを正しく表示できませんでした。以下の情報を確認してください：
          </p>
          <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <p>• isMDX: {String(post.isMDX)}</p>
            <p>• hasHtmlContent: {String(!!post.htmlContent)}</p>
            <p>• hasContent: {String(!!post.content)}</p>
            <p>• contentLength: {post.content?.length || 0}</p>
          </div>
          {fallbackContent}
        </div>
      )}

      {/* Mermaid図表のレンダリング */}
      {hasMermaid && <MermaidRenderer />}

      {/* 数式のレンダリング */}
      {hasMath ? <MathRenderer /> : null}
      {/* MermaidRendererフォールバック用: 元のMarkdownを非表示で埋め込む */}
      {post.content ? (
        <div data-markdown-content className="sr-only">{post.content}</div>
      ) : null}
    </div>
  );
}
