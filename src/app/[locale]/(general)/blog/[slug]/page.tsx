import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaAngleLeft, FaCalendar, FaClock } from 'react-icons/fa';
import BlogPostContent from '@/features/blog/components/BlogPostContent';
import CommentsSection from '@/features/blog/components/CommentsSection';
import SideTableOfContents from '@/features/blog/components/SideTableOfContents';
import Icon from '@/shared/components/ui/Icon';
import BackToTop from '@/shared/components/ui/BackToTop';
import { getAllBlogPosts, getBlogPost, getRelatedPosts } from '@/shared/libs/blog';
import { headers } from 'next/headers';
import { AppConfig } from '@/shared/utils/AppConfig';
import PostRating from '@/features/blog/components/PostRating';
import ShareButtons from '@/features/blog/components/ShareButtons';

type BlogPostPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

// サーバーサイド用の日付フォーマット関数
function formatDate(dateString: string, locale = 'ja'): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return date.toLocaleDateString(locale, options);
}

// 静的生成のためのパス生成
export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  // リクエストヘッダから絶対オリジンを構築
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const origin = `${proto}://${host}`;

  // 絶対URLでOG画像
  const ogImageUrl = `${origin}/api/og/blog?slug=${encodeURIComponent(slug)}`;

  return {
    title: `${post.title} | Blog`,
    description: post.description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.description || post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description || post.excerpt,
      images: [ogImageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getBlogPost(slug);
  const t = await getTranslations({ locale, namespace: 'Blog' });
  const related = post ? await getRelatedPosts(post.slug, 3) : [];

  // SSR側で安定したabsolute URLを生成（Hydration mismatch回避）
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const origin = `${proto}://${host}`;
  const isDefault = locale === AppConfig.defaultLocale && AppConfig.localePrefix === 'as-needed';
  const prefix = isDefault ? '' : `/${locale}`;
  const absoluteUrl = `${origin}${prefix}/blog/${encodeURIComponent(slug)}`;

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* パンくずナビ */}
      <nav className="container mx-auto px-4 py-6 max-w-7xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300 rounded-lg hover:bg-card/50 backdrop-blur-sm"
        >
          <Icon icon={<FaAngleLeft />} className="text-primary" />
          <span>{t('all_posts')}</span>
        </Link>
      </nav>

      {/* メインコンテンツエリア */}
      <div className="container mx-auto px-4 pb-16 max-w-7xl">
        <div className="lg:flex lg:gap-8">
          {/* 記事コンテンツ */}
          <article className="min-w-0 flex-1 max-w-none lg:max-w-4xl">
            {/* 記事ヘッダー */}
            <header className="pb-8 mb-8 border-b border-border/30">
              {/* タグ */}
              <div className="flex items-start gap-2 mb-6">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Link
                      key={`tag-${tag}`}
                      href={`/blog/tag/${encodeURIComponent(tag)}`}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-all duration-300 border border-primary/20"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                {post.title}
              </h1>

              {post.description && (
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {post.description}
                </p>
              )}

              {/* メタデータ */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <time dateTime={post.publishedAt} className="flex items-center gap-2">
                  <Icon icon={<FaCalendar />} className="text-primary" />
                  {formatDate(post.publishedAt, locale)}
                </time>
                <div className="flex items-center gap-2">
                  <Icon icon={<FaClock />} className="text-primary" />
                  {post.readingTime}
                </div>
              </div>
            </header>

            {/* 記事本文 */}
            <BlogPostContent post={post} />

            {/* 記事評価 */}
            <section aria-labelledby="rate-article" className="mt-10">
              <h2 id="rate-article" className="sr-only">{t('rate_this_article')}</h2>
              <PostRating slug={post.slug} />
            </section>

            {/* 共有ボタン */}
            <section aria-labelledby="share-article" className="mt-6">
              <h2 id="share-article" className="sr-only">{t('share')}</h2>
              <ShareButtons slug={post.slug} title={post.title} absoluteUrl={absoluteUrl} />
            </section>
          </article>

          {/* 右側目次エリア - デスクトップのみ */}
          <aside className="hidden lg:block w-64 xl:w-80 flex-shrink-0">
            <SideTableOfContents items={post.tableOfContents || []} />
          </aside>
        </div>
        {/* コメント */}
        <div className="mt-12 max-w-4xl">
          <CommentsSection slug={post.slug} />
        </div>

        {/* 関連記事（コメントの後ろに表示） */}
        <section aria-labelledby="related-articles" className="mt-12 max-w-4xl">
          <h2 id="related-articles" className="text-xl font-semibold mb-4">{t('related_articles')}</h2>
          {related.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('no_related_posts')}</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="block border border-border rounded-lg p-4 hover:bg-card/50 transition-colors">
                    <span className="text-primary hover:underline font-medium">{p.title}</span>
                    {p.description && (
                      <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{p.description}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* エラーの場合のフォールバック */}
      {!post.htmlContent && (
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-muted/50 rounded-2xl p-8 border border-border">
            <p className="text-muted-foreground mb-4">
              HTMLコンテンツの生成に失敗しました。元のMarkdownを表示します：
            </p>
            <pre className="whitespace-pre-wrap text-muted-foreground leading-relaxed font-mono text-sm overflow-x-auto">
              {post.content}
            </pre>
          </div>
        </div>
      )}

      {/* Back to Top */}
      <BackToTop />

      {/* フッター */}
      {/* <footer className="container mx-auto px-4 py-12 max-w-7xl text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-2xl hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 font-medium"
        >
          <Icon icon={<FaCalendar />} />
          <span>{t('all_posts')}</span>
        </Link>
      </footer> */}
    </div>
  );
}
