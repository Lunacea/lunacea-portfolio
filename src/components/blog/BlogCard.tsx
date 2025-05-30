'use client';

import type { BlogPostMeta } from '@/lib/blog';
import { faCalendarDays, faTag } from '@fortawesome/free-solid-svg-icons';
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
        transition-all duration-300 p-6"
      >

        {/* 背景グラデーション効果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3
          opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
        </div>

        <div className="relative z-10 space-y-4">
          {/* タグ（最大2個まで表示） */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Icon
                icon={faTag}
                className="text-primary/60 text-sm mt-0.5 mr-1"
              />
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
          )}

          {/* タイトル */}
          <h2 className="text-xl font-bold text-foreground group-hover:text-primary
            transition-colors duration-300 leading-tight line-clamp-2"
          >
            {post.title}
          </h2>

          {/* 抜粋 */}
          {post.excerpt && (
            <p className="text-muted-foreground leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* 日付のみ */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon icon={faCalendarDays} className="text-primary" />
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt, locale)}
            </time>
          </div>
        </div>
      </article>
    </Link>
  );
}
