'use client';

import { useMemo } from 'react';
import DOMPurify from 'dompurify';
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
  
  try {
    // DOMPurifyを使用してHTMLを安全にサニタイズ
    const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
      // 許可するタグと属性を制限
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'div', 'span'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id', 'target'
      ],
      // 危険なコンテンツを完全に除去
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'javascript:', 'vbscript:'],
      // データURIを無効化
      ALLOW_DATA_ATTR: false,
      // コメントを除去
      KEEP_CONTENT: false
    });
    
    return sanitizedHtml;
  } catch (error) {
    console.warn('HTML sanitization failed:', error);
    // サニタイゼーションが失敗した場合は安全なフォールバック
    return '<div class="error-fallback">HTMLの処理中にエラーが発生しました。</div>';
  }
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
