'use client';

import { useMemo } from 'react';
import TableOfContents from '@/features/blog/components/TableOfContents';
import MermaidRenderer from './MermaidRenderer';

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
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }
  
  // 基本的なサニタイゼーション（サーバー・クライアント共通）
  return htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

export default function BlogPostContentClient({ post }: BlogPostContentClientProps) {
  const safeHtmlContent = useMemo(() => {
    return sanitizeHtmlContent(post.htmlContent || '');
  }, [post.htmlContent]);

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
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: safeHtmlContent }} />
        </div>
      ) : (
        /* フォールバックコンテンツ */
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 my-6">
          <h3 className="text-red-800 font-semibold mb-2">デバッグ情報</h3>
          <p className="text-red-700 text-sm">isMDX: {String(post.isMDX)}</p>
          <p className="text-red-700 text-sm">hasHtmlContent: {String(!!post.htmlContent)}</p>
          <p className="text-red-700 text-sm">hasContent: {String(!!post.content)}</p>
          {fallbackContent}
        </div>
      )}
      
      {/* Mermaid図表のレンダリング */}
      <MermaidRenderer />
    </div>
  );
}
