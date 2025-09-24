import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaAngleLeft, FaCalendar, FaClock } from 'react-icons/fa';
import BlogPostContent from '@/features/blog/components/BlogPostContent';
import dynamic from 'next/dynamic';
const CommentsSection = dynamic(() => import('@/features/blog/shared/components/CommentsSection'), { loading: () => null });
const SideTableOfContents = dynamic(() => import('@/features/blog/shared/components/SideTableOfContents'), { loading: () => null });
import Icon from '@/shared/components/ui/Icon';
import BackToTop from '@/shared/components/ui/BackToTop';
import LazyVisible from '@/shared/components/ui/LazyVisible';
import { getAllBlogPostsHybrid, getBlogPostHybrid, getRelatedPostsHybrid } from '@/shared/libs/blog';
// import { Env } from '@/shared/libs/Env';
import { AppConfig } from '@/shared/utils/AppConfig';
const PostRating = dynamic(() => import('@/features/blog/shared/components/PostRating'), { loading: () => null });
const ShareButtons = dynamic(() => import('@/features/blog/shared/components/ShareButtons'), { loading: () => null });

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
  const posts = await getAllBlogPostsHybrid();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPostHybrid(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  // 記事の絶対URLを構築
  const isDefault = locale === AppConfig.defaultLocale && AppConfig.localePrefix === 'as-needed';
  const localePrefix = isDefault ? '' : `/${locale}`;
  const canonicalUrl = `https://lunacea.jp${localePrefix}/blog/${encodeURIComponent(slug)}`;
  
  // OG画像URL（静的ファイル、ビルド時生成）- 絶対URLに変更
  const ogImageUrl = `https://lunacea.jp/og-images/${encodeURIComponent(slug)}.png`;

  return {
    title: `${post.title} | Blog`,
    description: post.description || post.excerpt,
    keywords: post.tags,
    authors: [{ name: 'Lunacea', url: 'https://lunacea.jp' }],
    creator: 'Lunacea',
    publisher: 'Lunacea',
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'ja': `/ja/blog/${encodeURIComponent(slug)}`,
        'en': `/en/blog/${encodeURIComponent(slug)}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description || post.excerpt,
      url: canonicalUrl,
      siteName: 'Lunacea Portfolio',
      locale: locale,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      authors: ['Lunacea'],
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
      creator: '@lunacea_jp',
      site: '@lunacea_jp',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export const dynamicParams = true;
export const revalidate = 3600; // 1時間でISR

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getBlogPostHybrid(slug);
  const t = await getTranslations({ locale, namespace: 'Blog' });
  const related = post ? await getRelatedPostsHybrid(post.slug, 3) : [];

  const isDefault = locale === AppConfig.defaultLocale && AppConfig.localePrefix === 'as-needed';
  const prefix = isDefault ? '' : `/${locale}`;
  const absoluteUrl = `${prefix}/blog/${encodeURIComponent(slug)}`;

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

              {post.description ? (
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {post.description}
                </p>
              ) : null}

              {/* メタデータ */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground" suppressHydrationWarning>
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
            <LazyVisible ssrPlaceholderHeight={80} className="mt-10">
              <section aria-labelledby="rate-article">
                <h2 id="rate-article" className="sr-only">{t('rate_this_article')}</h2>
                <PostRating slug={post.slug} />
              </section>
            </LazyVisible>

            {/* 共有ボタン */}
            <LazyVisible ssrPlaceholderHeight={56} className="mt-6">
              <section aria-labelledby="share-article">
                <h2 id="share-article" className="sr-only">{t('share')}</h2>
                <ShareButtons slug={post.slug} title={post.title} absoluteUrl={absoluteUrl} />
              </section>
            </LazyVisible>
          </article>

          {/* 右側目次エリア - デスクトップのみ */}
          <aside className="hidden lg:block w-64 xl:w-80 flex-shrink-0">
            <SideTableOfContents items={post.tableOfContents || []} />
          </aside>
        </div>
        {/* コメント */}
        <LazyVisible ssrPlaceholderHeight={200} className="mt-12 max-w-4xl">
          <CommentsSection slug={post.slug} />
        </LazyVisible>

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
