'use client';

import type { BlogPostMeta } from '@/lib/blog';
import { faCalendarDays, faClock, faTag } from '@fortawesome/free-solid-svg-icons';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Icon } from '@/components/Icon';

type BlogCardProps = {
  post: BlogPostMeta;
};

// クライアントサイド用の日付フォーマット関数
function formatDate(dateString: string, locale: string = 'ja'): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return date.toLocaleDateString(locale, options);
}

export function BlogCard({ post }: BlogCardProps) {
  const locale = useLocale();

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group block relative overflow-hidden rounded-3xl
        bg-gradient-to-br from-card/90 to-background/80 backdrop-blur-sm
        shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.05)]
        hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.08)]
        transition-all duration-300 p-6 h-80 flex flex-col"
      >

        {/* 背景グラデーション効果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3
          opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* タグ（最大2個まで表示） */}
          {post.tags.length > 0 && (
            <div className="flex items-start gap-2 mb-4">
              <Icon
                icon={faTag}
                className="text-primary/60 text-sm mt-0.5 flex-shrink-0"
              />
              <div className="flex flex-wrap gap-2 min-h-[1.5rem]">
                {post.tags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium
                      bg-primary/10 text-primary rounded-full border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
                {post.tags.length > 2 && (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium
                    bg-muted/20 text-muted-foreground rounded-full"
                  >
                    +
                    {post.tags.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* タイトル - 2行固定 */}
          <h2 className="text-xl font-bold text-foreground group-hover:text-primary
            transition-colors duration-300 leading-tight mb-4 h-14 flex items-start"
          >
            <span className="line-clamp-2">
              {post.title}
            </span>
          </h2>

          {/* 抜粋 - フレキシブル */}
          <div className="flex-1 mb-4">
            {post.excerpt && (
              <p className="text-muted-foreground leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            )}
          </div>

          {/* メタデータ - 個別記事と同じスタイル */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <time dateTime={post.publishedAt} className="flex items-center gap-2">
              <Icon icon={faCalendarDays} className="text-primary" />
              {formatDate(post.publishedAt, locale)}
            </time>
            <div className="flex items-center gap-2">
              <Icon icon={faClock} className="text-accent" />
              {post.readingTime}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
