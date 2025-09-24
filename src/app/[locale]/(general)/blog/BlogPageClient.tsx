'use client';

import { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import BlogCard from '@/features/blog/components/BlogCard';
import PublicBlogSearch from '@/features/blog/components/PublicBlogSearch';
import ContributionGraph from '@/features/blog/components/ContributionGraph';
import EmptyStateCard from '@/shared/components/ui/EmptyStateCard';
import Icon from '@/shared/components/ui/Icon';
import ScrollReveal from '@/shared/components/ui/ScrollReveal';
import { BlogPostMeta } from '@/shared/libs/blog.impl';

type BlogPageClientProps = {
  posts: BlogPostMeta[];
  t: {
    preparing_title: string;
    preparing_description: string;
  };
};

export default function BlogPageClient({ posts, t }: BlogPageClientProps) {
  const [displayedPosts, setDisplayedPosts] = useState(posts);

  const handleSearchResults = (filteredPosts: BlogPostMeta[]) => {
    setDisplayedPosts(filteredPosts);
  };

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

        {/* 検索機能 */}
        <ScrollReveal direction="fade" delay={150}>
          <PublicBlogSearch posts={posts} onSearchResults={handleSearchResults} />
        </ScrollReveal>

        {/* ブログ記事一覧 */}
        <ScrollReveal direction="fade" delay={200}>
          {displayedPosts.length > 0 ? (
            <div className="space-y-8">
              {/* グリッドレイアウト */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedPosts.map(post => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          ) : posts.length === 0 ? (
            // 記事が全くない場合のみ「準備中」メッセージを表示
            <EmptyStateCard
              icon={<Icon icon={<FaEdit />} className="text-foreground text-4xl" />}
              title={t.preparing_title}
              description={t.preparing_description}
            />
          ) : null}
        </ScrollReveal>
      </div>
    </div>
  );
}
