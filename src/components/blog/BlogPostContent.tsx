'use client';

import { useMemo } from 'react';
import { TableOfContents } from '@/components/blog/TableOfContents';

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

/**
 * HTMLコンテンツを安全に処理する関数
 * サーバーサイドで生成された信頼できるMDXコンテンツ用
 */
function sanitizeHtmlContent(htmlContent: string): string {
  // 基本的なサニタイゼーション：空文字列や危険なスクリプトタグをチェック
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  // 基本的な悪意のあるコンテンツをチェック（開発時の安全チェック）
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  const hasDangerousContent = dangerousPatterns.some(pattern => pattern.test(htmlContent));

  if (hasDangerousContent) {
    console.warn('Potentially dangerous content detected in blog post HTML');
    return '<div class="error-fallback">安全でないコンテンツが検出されました。</div>';
  }

  return htmlContent;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  // HTMLコンテンツを安全に処理（メモ化）
  const safeHtmlContent = useMemo(() => {
    return sanitizeHtmlContent(post.htmlContent || '');
  }, [post.htmlContent]);

  // HTMLコンテンツがない場合のフォールバック
  const fallbackContent = useMemo(() => {
    if (!safeHtmlContent && post.content) {
      return (
        <div className="bg-muted/50 rounded-2xl p-6 border border-border">
          <p className="text-muted-foreground mb-4 text-sm">
            HTMLコンテンツの生成に失敗しました。元のMarkdownを表示します：
          </p>
          <pre className="whitespace-pre-wrap text-muted-foreground leading-relaxed font-mono text-sm overflow-x-auto">
            {post.content}
          </pre>
        </div>
      );
    }
    return null;
  }, [safeHtmlContent, post.content]);

  return (
    <div>
      {/* 折り畳み目次（モバイル・タブレット用のみ） */}
      <TableOfContents items={post.tableOfContents || []} className="mb-8 lg:hidden" />

      {/* 記事本文 */}
      {safeHtmlContent && (
        <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-pre:!bg-transparent prose-pre:!p-0 prose-pre:!m-0">
          {/*
            WARNING: このdangerouslySetInnerHTMLは信頼できるサーバーサイド処理済みMDXコンテンツを表示するためのものです。
            コンテンツはbuild時にMarkdownから生成され、適切にサニタイズされています。
          */}
          {/* eslint-disable-next-line react-dom/no-dangerously-set-innerhtml */}
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: safeHtmlContent }} />
        </div>
      )}

      {!safeHtmlContent && fallbackContent}
    </div>
  );
}
