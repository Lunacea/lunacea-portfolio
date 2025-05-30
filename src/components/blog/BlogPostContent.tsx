'use client';

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

export function BlogPostContent({ post }: BlogPostContentProps) {
  return (
    <div>
      {/* 折り畳み目次（モバイル・タブレット用のみ） */}
      <TableOfContents items={post.tableOfContents || []} className="mb-8 lg:hidden" />

      {/* 記事本文 */}
      <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-pre:!bg-transparent prose-pre:!p-0 prose-pre:!m-0">
        <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.htmlContent || '' }} />
      </div>
    </div>
  );
}
