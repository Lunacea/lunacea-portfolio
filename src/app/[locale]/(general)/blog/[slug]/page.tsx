import type { Metadata } from 'next';
import { faArrowLeft, faCalendar, faClock, faTag } from '@fortawesome/free-solid-svg-icons';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogPostContent } from '@/components/blog/BlogPostContent';
import { SideTableOfContents } from '@/components/blog/SideTableOfContents';
import { Icon } from '@/components/Icon';
import { getAllBlogPosts, getBlogPost } from '@/lib/blog';

type BlogPostPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

// サーバーサイド用の日付フォーマット関数
function formatDate(dateString: string, locale: string = 'ja'): string {
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
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getBlogPost(slug);
  const t = await getTranslations({ locale, namespace: 'Blog' });

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
          <Icon icon={faArrowLeft} className="text-primary" />
          <span>{t('all_posts')}</span>
        </Link>
      </nav>

      {/* メインコンテンツエリア - Next.js公式風レイアウト */}
      <div className="container mx-auto px-4 pb-16 max-w-7xl">
        <div className="lg:flex lg:gap-8">
          {/* 記事コンテンツ */}
          <article className="min-w-0 flex-1 max-w-none lg:max-w-4xl">
            {/* 記事ヘッダー */}
            <header className="pb-8 mb-8 border-b border-border/30">
              {/* タグ */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Icon icon={faTag} className="text-primary/60 text-sm mt-1 mr-2" />
                {post.tags.map((tag, index) => (
                  <Link
                    key={`tag-${index}-${tag}`}
                    href={`/blog/tag/${encodeURIComponent(tag)}`}
                    className="inline-flex items-center px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-all duration-300 border border-primary/20"
                  >
                    {tag}
                  </Link>
                ))}
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
                  <Icon icon={faCalendar} className="text-primary" />
                  {formatDate(post.publishedAt, locale)}
                </time>
                <div className="flex items-center gap-2">
                  <Icon icon={faClock} className="text-accent" />
                  {post.readingTime}
                </div>
              </div>
            </header>

            {/* 記事本文 */}
            <BlogPostContent post={post} />
          </article>

          {/* 右側目次エリア - デスクトップのみ */}
          <aside className="hidden lg:block w-64 xl:w-80 flex-shrink-0">
            <SideTableOfContents items={post.tableOfContents || []} />
          </aside>
        </div>
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

      {/* フッター */}
      <footer className="container mx-auto px-4 py-12 max-w-7xl text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-2xl hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 font-medium"
        >
          <Icon icon={faArrowLeft} />
          <span>{t('all_posts')}</span>
        </Link>
      </footer>
    </div>
  );
}
