import type { Metadata } from 'next';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BlogCard } from '@/components/blog/BlogCard';
import { Icon } from '@/components/Icon';
import { getAllBlogPosts } from '@/lib/blog';

type BlogPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Blog' });
  const posts = await getAllBlogPosts();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* ページヘッダー */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl">
              <Icon icon={faEdit} className="text-primary-foreground text-2xl" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Blog
            </h1>
          </div>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('meta_description')}
          </p>

          {/* 統計情報 */}
          {posts.length > 0 && (
            <div className="mt-8 pt-8 border-t border-border/30">
              <div className="flex items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{posts.length}</strong>
                    {' '}
                    記事
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-muted-foreground">
                    定期更新中
                  </span>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* ブログ記事一覧 */}
        {posts.length > 0
          ? (
              <div className="space-y-8">
                {/* グリッドレイアウト */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map(post => (
                    <BlogCard key={post.slug} post={post} />
                  ))}
                </div>

                {/* フッター装飾 */}
                <div className="text-center mt-16 pt-8">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-card/50 backdrop-blur-sm rounded-full border border-border/30">
                    <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
                    <span className="text-muted-foreground text-sm">
                      さらなる記事を準備中...
                    </span>
                  </div>
                </div>
              </div>
            )
          : (
              <div className="text-center py-20">
                <div className="relative inline-block">
                  {/* 背景エフェクト */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl blur-2xl scale-110"></div>

                  <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-16 border border-border/50 shadow-[0_16px_64px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl mx-auto mb-8">
                      <Icon icon={faEdit} className="text-primary text-4xl" />
                    </div>

                    <h2 className="text-3xl font-bold text-foreground mb-4">
                      {t('no_posts')}
                    </h2>

                    <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                      近日中に技術記事やプロジェクトの紹介記事を公開予定です。お楽しみに！
                    </p>

                    <div className="mt-8 flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse animation-delay-200"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse animation-delay-400"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
      </div>
    </div>
  );
}
