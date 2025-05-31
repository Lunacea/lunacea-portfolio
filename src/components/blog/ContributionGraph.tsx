import type { BlogPostMeta } from '@/lib/blog';
import React, { useMemo } from 'react';
import { DayCell } from '@/components/blog/DayCell';

type ContributionGraphProps = {
  posts: BlogPostMeta[];
  weekCount?: number;
};

// 投稿数に基づいて色の濃さを決定 (DayCell から移動)
const getIntensityClass = (count: number): string => {
  if (count === 0) {
    return 'bg-gradient-to-br from-muted/40 to-muted/60 shadow-inner shadow-black/10 dark:shadow-black/30 border border-black/5 dark:border-white/5';
  }
  if (count === 1) {
    return 'bg-gradient-to-br from-primary/40 to-primary/60 shadow-inner shadow-primary/20 dark:shadow-primary/30 border border-primary/10 dark:border-white/5';
  }
  if (count === 2) {
    return 'bg-gradient-to-br from-primary/60 to-primary/80 shadow-inner shadow-primary/30 dark:shadow-primary/40 border border-primary/15 dark:border-white/5';
  }
  return 'bg-gradient-to-br from-primary/80 to-primary shadow-inner shadow-primary/40 dark:shadow-primary/50 border border-primary/20 dark:border-white/5';
};

// 補助関数を先に定義
const getPostCountForDate = (targetDate: string, blogPosts: BlogPostMeta[]): number => {
  return blogPosts.filter((post) => {
    const publishedDate = post.publishedAt;
    if (!publishedDate) {
      return false;
    }
    try {
      const postDate = new Date(publishedDate).toISOString().split('T')[0];
      return postDate === targetDate;
    } catch {
      return false;
    }
  }).length;
};

const getMonthLabel = (weekDates: (string | undefined)[]): string | null => {
  for (const dateStr of weekDates) {
    if (!dateStr) {
      continue;
    }
    try {
      const date = new Date(dateStr);
      if (date.getDate() === 1) {
        return date.toLocaleDateString('en-US', { month: 'short' });
      }
    } catch {}
  }
  return null;
};

const isFirstDayOfMonth = (dateStr: string): boolean => {
  try {
    const date = new Date(dateStr);
    return date.getDate() === 1;
  } catch {
    return false;
  }
};

export function ContributionGraph({ posts, weekCount = 20 }: ContributionGraphProps) {
  const dateRange = useMemo(() => {
    const today = new Date();
    const days = [];
    const totalDays = weekCount * 7;
    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  }, [weekCount]);

  const processedWeeks = useMemo(() => {
    const weeksData = [];
    for (let i = 0; i < dateRange.length; i += 7) {
      weeksData.push(dateRange.slice(i, i + 7));
    }

    return weeksData.map((week, weekIndex) => {
      const monthLabel = getMonthLabel(week);
      const weekKey = week[0] || `week-${weekIndex}`;
      const daysInWeek = week.map((date, dayIndex) => {
        const count = date ? getPostCountForDate(date, posts) : 0;
        const isMonthStart = date ? isFirstDayOfMonth(date) : false;
        const intensityClass = getIntensityClass(count);
        return {
          key: date || `empty-${weekKey}-${dayIndex}`,
          date,
          count,
          isMonthStart,
          intensityClass,
          weekKey,
        };
      });
      return { weekKey, monthLabel, daysInWeek };
    });
  }, [dateRange, posts]);

  const totalPosts = posts.length;
  const activeDays = useMemo(() => dateRange.filter(date => date && getPostCountForDate(date, posts) > 0).length, [dateRange, posts]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          過去
          {weekCount}
          {' '}
          週間の更新頻度
        </span>
        <span>
          {totalPosts}
          {' '}
          記事 •
          {' '}
          {activeDays}
          {' '}
          日間活動
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex items-start gap-1 p-3 pt-6 bg-card/30 rounded-xl border border-border/30 min-w-fit">
          <div className="flex flex-col gap-1 text-xs text-muted-foreground mr-2 flex-shrink-0">
            <div className="h-4 flex items-end"></div>
            <div className="h-3 flex items-center">Sun</div>
            <div className="h-3 flex items-center">Mon</div>
            <div className="h-3 flex items-center">Tue</div>
            <div className="h-3 flex items-center">Wed</div>
            <div className="h-3 flex items-center">Thu</div>
            <div className="h-3 flex items-center">Fri</div>
            <div className="h-3 flex items-center">Sat</div>
          </div>

          <div className="flex gap-1">
            {processedWeeks.map(weekData => (
              <div key={weekData.weekKey} className="flex flex-col gap-1 w-3">
                <div className="h-4 flex items-end justify-start">
                  {weekData.monthLabel && (
                    <span className="text-xs text-muted-foreground font-medium whitespace-nowrap -ml-1">
                      {weekData.monthLabel}
                    </span>
                  )}
                </div>
                {weekData.daysInWeek.map(dayData => (
                  <DayCell
                    key={dayData.key}
                    date={dayData.date}
                    count={dayData.count}
                    isMonthStart={dayData.isMonthStart}
                    intensityClass={dayData.intensityClass}
                    weekKey={dayData.weekKey}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>low</span>
        <div className="flex items-center gap-1">
          <div className={`w-2.5 h-2.5 rounded-md ${getIntensityClass(0)}`}></div>
          <div className={`w-2.5 h-2.5 rounded-md ${getIntensityClass(1)}`}></div>
          <div className={`w-2.5 h-2.5 rounded-md ${getIntensityClass(2)}`}></div>
          <div className={`w-2.5 h-2.5 rounded-md ${getIntensityClass(3)}`}></div>
        </div>
        <span>high</span>
      </div>
    </div>
  );
}
