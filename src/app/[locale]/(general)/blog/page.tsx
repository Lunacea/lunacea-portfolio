import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FaEdit } from 'react-icons/fa';
import { BlogCard } from '@/components/blog/BlogCard';
import { ContributionGraph } from '@/components/blog/ContributionGraph';
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

  const posts = await getAllBlogPosts();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* ページヘッダー */}
        <header className="text-center mb-16">

          {/* 統計情報 */}
          {/* GitHub草風の更新頻度グラフ */}
          <div className="max-w-2xl mx-auto">
            <ContributionGraph posts={posts} weekCount={20} />
          </div>
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
                {/* <div className="text-center mt-16 pt-8">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-card/50 backdrop-blur-sm rounded-full border border-border/30">
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-muted-foreground text-sm">
                      さらなる記事を準備中...
                    </span>
                  </div>
                </div> */}
              </div>
            )
          : (
              <div className="text-center py-20">
                <div className="relative inline-block">
                  {/* 背景エフェクト */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl blur-2xl scale-110"></div>

                  <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-16 border border-border/50 shadow-[0_16px_64px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center justify-center w-24 h-24 bg-card/50 backdrop-blur-sm border border-border/30 rounded-3xl mx-auto mb-8">
                      <Icon icon={<FaEdit />} className="text-foreground text-4xl" />
                    </div>

                    <h2 className="text-3xl font-bold text-foreground mb-4">
                      記事を準備中です
                    </h2>

                    <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                      近日中に技術記事やプロジェクトの紹介記事を公開予定です。お楽しみに！
                    </p>

                    <div className="mt-8 flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse animation-delay-200"></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse animation-delay-400"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
      </div>
    </div>
  );
}
