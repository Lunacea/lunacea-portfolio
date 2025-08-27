'use client';

import { useMemo } from 'react';
import TableOfContents from '@/features/blog/components/TableOfContents';

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
};

type BlogPostContentProps = {
  post: BlogPost;
};

function sanitizeHtmlContent(htmlContent: string): string {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }
  
  // より安全で正確な危険パターンの検出
  const dangerousPatterns = [
    // scriptタグ（開始と終了を含む）
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    // javascript:プロトコル
    /javascript:/gi,
    // イベントハンドラー属性
    /on\w+\s*=/gi,
    // iframeタグ
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    // objectタグ
    /<object[^>]*>[\s\S]*?<\/object>/gi,
    // embedタグ
    /<embed[^>]*>/gi,
    // データURI（危険な可能性）
    /data:text\/html/gi,
    // vbscript:プロトコル
    /vbscript:/gi,
    // 式属性（IE固有）
    /expression\s*\(/gi,
  ];
  
  const hasDangerousContent = dangerousPatterns.some(pattern => pattern.test(htmlContent));
  if (hasDangerousContent) {
    // Potentially dangerous content detected in blog post HTML
    return '<div class="error-fallback">安全でないコンテンツが検出されました。</div>';
  }
  return htmlContent;
}

export default function BlogPostContent({ post }: BlogPostContentProps) {
  const safeHtmlContent = useMemo(() => {
    return sanitizeHtmlContent(post.htmlContent || '');
  }, [post.htmlContent]);

  const fallbackContent = useMemo(() => {
    if (!safeHtmlContent && post.content) {
      return (
        <div className="bg-muted/50 rounded-2xl p-6 border border-border">
          <p className="text-muted-foreground mb-4 text-sm">HTMLコンテンツの生成に失敗しました。元のMarkdownを表示します：</p>
          <pre className="whitespace-pre-wrap text-muted-foreground leading-relaxed font-mono text-sm overflow-x-auto">{post.content}</pre>
        </div>
      );
    }
    return null;
  }, [safeHtmlContent, post.content]);

  return (
    <div>
      <TableOfContents items={post.tableOfContents || []} className="mb-8 lg:hidden" />
      {safeHtmlContent && (
        <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-pre:!bg-transparent prose-pre:!p-0 prose-pre:!m-0">
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: safeHtmlContent }} />
        </div>
      )}
      {!safeHtmlContent && fallbackContent}
    </div>
  );
}
