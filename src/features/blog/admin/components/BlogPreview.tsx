'use client';

import { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { parseMarkdownToHtml, extractTableOfContentsFromMarkdown } from '@/shared/libs/mdx-client';

// 動的インポート（SSR無効化）
const TableOfContents = dynamic(() => import('@/features/blog/shared/components/TableOfContents'), { 
  ssr: false, 
  loading: () => null 
}) as React.ComponentType<{ items: { id: string; title: string; level: number; }[]; className?: string; }>;

const MermaidRenderer = dynamic(() => import('@/features/blog/shared/components/MermaidRenderer'), { 
  ssr: false, 
  loading: () => null 
});

const MathRenderer = dynamic(() => import('@/features/blog/shared/components/MathRenderer'), { 
  ssr: false, 
  loading: () => null 
});

const CodeCopyEnhancer = dynamic(() => import('@/features/blog/shared/components/CodeCopyEnhancer'), { 
  ssr: false, 
  loading: () => null 
});

type BlogPreviewProps = {
  title: string;
  content: string;
  description?: string;
  tags?: string[];
};

type PreviewState = {
  htmlContent: string;
  tableOfContents: Array<{ id: string; title: string; level: number }>;
  isLoading: boolean;
  error: string | null;
};

export default function BlogPreview({ title, content, description, tags = [] }: BlogPreviewProps) {
  const [previewState, setPreviewState] = useState<PreviewState>({
    htmlContent: '',
    tableOfContents: [],
    isLoading: true,
    error: null,
  });

  // MarkdownからHTMLへの変換
  useEffect(() => {
    const convertContent = async () => {
      if (!content.trim()) {
        setPreviewState({
          htmlContent: '',
          tableOfContents: [],
          isLoading: false,
          error: null,
        });
        return;
      }

      try {
        setPreviewState(prev => ({ ...prev, isLoading: true, error: null }));

        // APIエンドポイントを使用してサーバーサイドのMDX処理を実行
        const response = await fetch('/api/v1/mdx/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { htmlContent } = await response.json();
        
        // テーブルオブコンテンツの抽出
        const tableOfContents = extractTableOfContentsFromMarkdown(content);

        setPreviewState({
          htmlContent,
          tableOfContents,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Preview conversion error:', error);
        // フォールバック: クライアントサイド変換を使用
        try {
          const htmlContent = parseMarkdownToHtml(content);
          const tableOfContents = extractTableOfContentsFromMarkdown(content);
          
          setPreviewState({
            htmlContent,
            tableOfContents,
            isLoading: false,
            error: null,
          });
        } catch {
          setPreviewState({
            htmlContent: '',
            tableOfContents: [],
            isLoading: false,
            error: error instanceof Error ? error.message : '変換エラーが発生しました',
          });
        }
      }
    };

    convertContent();
  }, [content]);

  // コードブロックの検出
  const hasCodeBlocks = useMemo(() => {
    return previewState.htmlContent.includes('<pre') || previewState.htmlContent.includes('<code');
  }, [previewState.htmlContent]);

  // Mermaid図表の検出
  const hasMermaid = useMemo(() => {
    const html = previewState.htmlContent.toLowerCase();
    return html.includes('language-mermaid') || html.includes('mermaid') || html.includes('mermaid-placeholder');
  }, [previewState.htmlContent]);

  // 数式の検出
  const hasMath = useMemo(() => {
    const html = previewState.htmlContent;
    return html.includes('math-inline') || html.includes('math-display');
  }, [previewState.htmlContent]);

  // フォールバックコンテンツ
  const fallbackContent = useMemo(() => {
    if (!previewState.htmlContent && content) {
      return (
        <div className="p-0">
          <p className="text-muted-foreground mb-2 text-sm">プレビューの生成に失敗しました。元のMarkdownを表示します：</p>
          <pre className="whitespace-pre-wrap text-muted-foreground leading-relaxed font-mono text-sm overflow-x-auto">
            {content}
          </pre>
        </div>
      );
    }
    return null;
  }, [previewState.htmlContent, content]);

  if (previewState.isLoading) {
    return (
      <div className="prose max-w-none">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => (
              <span key={`tag-${tag}`} className="inline-flex items-center px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
                {tag}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-semibold">{title || 'タイトル未設定'}</h1>
        {description && <p className="text-base text-muted-foreground mb-4">{description}</p>}
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-2 text-muted-foreground">プレビューを生成中...</span>
        </div>
      </div>
    );
  }

  if (previewState.error) {
    return (
      <div className="prose max-w-none">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => (
              <span key={`tag-${tag}`} className="inline-flex items-center px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
                {tag}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-semibold">{title || 'タイトル未設定'}</h1>
        {description && <p className="text-base text-muted-foreground mb-4">{description}</p>}
        <div className="p-0 my-4">
          <h3 className="text-red-800 font-semibold mb-2">プレビューエラー</h3>
          <p className="text-red-700 text-sm">{previewState.error}</p>
          {fallbackContent}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* プレビューヘッダー */}
      <div className="mb-8">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => (
              <span key={`tag-${tag}`} className="inline-flex items-center px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
                {tag}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-semibold text-foreground">{title || 'タイトル未設定'}</h1>
        {description && (
          <p className="text-base text-muted-foreground mb-4 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* メインコンテンツエリア */}
      <div className="max-w-4xl min-h-[24rem]">
        {/* 記事コンテンツ */}
        <article className="min-w-0 flex-1 max-w-none">
          <TableOfContents items={previewState.tableOfContents} className="mb-8 lg:hidden" />
          
          {/* HTMLコンテンツのレンダリング */}
          {previewState.htmlContent ? (
            <div className="prose max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-pre:!bg-transparent prose-pre:!p-0 prose-pre:!m-0">
              <div className="blog-content no-wrap-inline-code" dangerouslySetInnerHTML={{ __html: previewState.htmlContent }} />
              {hasCodeBlocks ? <CodeCopyEnhancer /> : null}
            </div>
          ) : (
            fallbackContent
          )}
          
          {/* Mermaid図表のレンダリング */}
          {hasMermaid ? <MermaidRenderer /> : null}
          
          {/* 数式のレンダリング */}
          {hasMath ? <MathRenderer /> : null}
        </article>
      </div>
    </div>
  );
}
