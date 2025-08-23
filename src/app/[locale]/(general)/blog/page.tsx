import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FaEdit } from 'react-icons/fa';
import BlogCard from '@/features/blog/components/BlogCard';
import ContributionGraph from '@/features/blog/components/ContributionGraph';
import EmptyStateCard from '@/shared/components/ui/EmptyStateCard';
import Icon from '@/shared/components/ui/Icon';
import ScrollReveal from '@/shared/components/ui/ScrollReveal';
import { getAllBlogPosts } from '@/shared/libs/blog';

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
          <ScrollReveal direction="fade" delay={100}>
            {/* 統計情報 */}
            {/* GitHub草風の更新頻度グラフ */}
            <div className="max-w-2xl mx-auto">
              <ContributionGraph posts={posts} weekCount={20} />
            </div>
          </ScrollReveal>
        </header>

        {/* ブログ記事一覧 */}
        <ScrollReveal direction="fade" delay={200}>
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
                <EmptyStateCard
                  icon={<Icon icon={<FaEdit />} className="text-foreground text-4xl" />}
                  title={t('preparing_title')}
                  description={t('preparing_description')}
                />
              )}
        </ScrollReveal>
      </div>
    </div>
  );
}
