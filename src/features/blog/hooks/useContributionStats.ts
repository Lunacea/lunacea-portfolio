import type { BlogPostMeta } from '@/shared/libs/blog';
import { useMemo } from 'react';

export const getIntensityClass = (count: number): string => {
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

const getPostCountForDate = (targetDate: string, blogPosts: BlogPostMeta[]): number => {
  return blogPosts.filter((post) => {
    const publishedDate = post.publishedAt;
    if (!publishedDate) {
      return 0;
    }
    try {
      const postDate = new Date(publishedDate).toISOString().split('T')[0]!;
      return postDate === targetDate;
    } catch {
      return 0;
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
    return new Date(dateStr).getDate() === 1;
  } catch {
    return false;
  }
};

export function useContributionStats(posts: BlogPostMeta[], weekCount: number = 20) {
  const dateRange = useMemo(() => {
    const today = new Date();
    const days: string[] = [];
    const totalDays = weekCount * 7;
    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]!);
    }
    return days;
  }, [weekCount]);

  const processedWeeks = useMemo(() => {
    const weeksData: Array<(string | undefined)[]> = [];
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
        return { key: date || `empty-${weekKey}-${dayIndex}`, date, count, isMonthStart, intensityClass, weekKey };
      });
      return { weekKey, monthLabel, daysInWeek };
    });
  }, [dateRange, posts]);

  const totalPosts = posts.length;
  const activeDays = useMemo(() => dateRange.filter(date => date && getPostCountForDate(date, posts) > 0).length, [dateRange, posts]);

  return { dateRange, processedWeeks, totalPosts, activeDays };
}
