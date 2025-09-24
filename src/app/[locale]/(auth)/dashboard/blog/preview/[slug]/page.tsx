import { notFound, redirect } from 'next/navigation';
import { auth } from '@/shared/libs/auth-server';
import { db } from '@/shared/libs/blog-db';
import { blogPosts } from '@/shared/models/Schema';
import { eq } from 'drizzle-orm';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import BlogPostContent from '@/features/blog/components/BlogPostContent';
import { Metadata } from 'next';

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PreviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  
      const post = await db.select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);

  if (post.length === 0) {
    return {
      title: '記事が見つかりません',
    };
  }

  return {
    title: `${post[0]?.title} - プレビュー`,
    description: post[0]?.description || 'ブログ記事のプレビュー',
  };
}

export default async function PreviewBlogPostPage({ params }: PreviewPageProps) {
  const { slug } = await params;
  
  // 認証チェック
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // 記事の取得
      const post = await db.select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);

  if (post.length === 0) {
    notFound();
  }

  // 権限チェック（作成者のみプレビュー可能）
  if (post[0]?.authorId !== userId) {
    redirect('/blog/editor');
  }

  const blogPost = post[0];

  // 言語は記事ページと同様に処理（UI文言の整合）
  const locale = 'ja';
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Blog' });

  return (
    <div className="min-h-screen">
      {/* パンくず & ヘッダー */}
      <nav className="container mx-auto px-4 py-6 max-w-7xl">
        <Link
          href="/blog/editor"
          className="inline-flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300 rounded-lg hover:bg-card/50 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('all_posts')}</span>
        </Link>
      </nav>

      <div className="container mx-auto px-4 pb-16 max-w-7xl">
        <div className="lg:flex lg:gap-8">
          {/* 記事コンテンツ */}
          <article className="min-w-0 flex-1 max-w-none lg:max-w-4xl">
            <header className="pb-8 mb-8 border-b border-border/30">
              <div className="flex items-start gap-2 mb-6">
                <div className="flex flex-wrap gap-2">
                  {(blogPost.tags || []).map((tag: string) => (
                    <span key={`tag-${tag}`} className="inline-flex items-center px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                {blogPost.title}
              </h1>

              {blogPost.description ? (
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {blogPost.description}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {blogPost.createdAt.toLocaleDateString('ja-JP')}
                </div>
                {blogPost.readingTime ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {blogPost.readingTime}分
                  </div>
                ) : null}
              </div>
            </header>

            {/* 本文（記事ページのクライアントと同一コンポーネントを利用） */}
            <BlogPostContent post={{
              slug: blogPost.slug,
              title: blogPost.title,
              description: blogPost.description || undefined,
              publishedAt: blogPost.publishedAt?.toISOString() || blogPost.createdAt.toISOString(),
              updatedAt: blogPost.updatedAt?.toISOString(),
              tags: blogPost.tags || [],
              readingTime: String(blogPost.readingTime || '5'),
              content: blogPost.content,
              htmlContent: blogPost.contentHtml || undefined,
              tableOfContents: [],
              excerpt: blogPost.excerpt || undefined,
              isMDX: true,
            }} />
          </article>

          {/* 右側目次（プレースホルダ）*/}
          <aside className="hidden lg:block w-64 xl:w-80 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}

/* 旧UIブロックは削除済み */
