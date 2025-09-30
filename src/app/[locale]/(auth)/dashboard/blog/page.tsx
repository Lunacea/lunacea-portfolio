import { setRequestLocale } from 'next-intl/server';
import BlogStats from '@/features/blog/admin/components/BlogStats';
import BlogListManager from '@/features/blog/admin/components/BlogListManager';
import { getUserBlogStats, getLikeCountsForPostIds, getViewsTrend, getLikeTrend, getPopularPosts, getRecentComments } from '@/features/blog/admin/actions/statsActions';
import { getUserAnalyticsEvents } from '@/features/blog/admin/actions/analyticsActions';
import { searchBlogPosts } from '@/features/blog/admin/actions/searchActions';

type BlogEditorPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BlogEditorPage({ params }: BlogEditorPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // サーバー側で統計・推移・ランキング・最近コメント、Analytics、記事一覧（下書き/公開）を並列取得
  const [stats, views30, likes30, popular, recent, analytics, draftsRes, publishedRes] = await Promise.all([
    getUserBlogStats(),
    getViewsTrend(30),
    getLikeTrend(30),
    getPopularPosts(10),
    getRecentComments(10),
    getUserAnalyticsEvents(30),
    searchBlogPosts({ status: 'draft', limit: 100 }),
    searchBlogPosts({ status: 'published', limit: 100 }),
  ]);

  // いいね数を一括取得（N+1回避）
  const allIds = [...draftsRes.results, ...publishedRes.results].map(p => p.id);
  const likeRows = allIds.length > 0 ? await getLikeCountsForPostIds(allIds) : [];
  const likeMap = likeRows.reduce((acc, r) => {
    acc[r.postId] = r.likeCount;
    return acc;
  }, {} as Record<number, number>);

  return (
  <div className="min-h-screen flex flex-col md:flex-row gap-4">
    {/* 左サイド（ブログ記事関連） */}
    <div className="container mx-auto py-4 flex-1">
      <BlogListManager initialDrafts={draftsRes.results} initialPublished={publishedRes.results} initialLikeCounts={likeMap} />
    </div>

    {/* 右サイド（ダッシュボード関連） */}
    <div className="container mx-auto py-4 md:flex-2 lg:flex-3">
      {/* 統計情報 */}
      <BlogStats
        initialStats={stats}
        initialViewsTrend={views30}
        initialLikeTrend={likes30}
        initialPopularPosts={popular}
        initialRecentComments={recent}
        initialAnalytics={analytics}
      />
    </div>
  </div>
  );
}
