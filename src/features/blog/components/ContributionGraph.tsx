import type { BlogPostMeta } from '@/shared/libs/blog';
import { useTranslations } from 'next-intl';
import React from 'react';
import DayCell from '@/features/blog/components/DayCell';
import { getIntensityClass, useContributionStats } from '@/features/blog/hooks/useContributionStats';

type ContributionGraphProps = {
  posts: BlogPostMeta[];
  weekCount?: number;
};

export default function ContributionGraph({ posts, weekCount = 20 }: ContributionGraphProps) {
  const t = useTranslations('ContributionGraph');
  const { processedWeeks, totalPosts, activeDays } = useContributionStats(posts, weekCount);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{t('past_week_count', { count: weekCount })}</span>
        <span>
          {totalPosts}
          {' '}
          {t('articles')}
          {' '}
          {activeDays}
          {' '}
          {t('active_days')}
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex items-start gap-1 p-3 pt-6 bg-card/30 rounded-xl border border-border/30 min-w-fit">
          <div className="flex flex-col gap-1 text-xs text-muted-foreground mr-2 flex-shrink-0">
            <div className="h-4 flex items-end" />
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
              <div key={`week-${weekData.weekKey}`} className="flex flex-col gap-1 w-3">
                <div className="h-4 flex items-end justify-start">
                  {weekData.monthLabel && (
                    <span className="text-xs text-muted-foreground font-medium whitespace-nowrap -ml-1">{weekData.monthLabel}</span>
                  )}
                </div>
                {weekData.daysInWeek.map(dayData => (
                  <DayCell key={`day-${dayData.key}`} date={dayData.date} count={dayData.count} isMonthStart={dayData.isMonthStart} intensityClass={dayData.intensityClass} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>low</span>
        <div className="flex items-center gap-1">
          <div className={`w-2.5 h-2.5 rounded-md ${getIntensityClass(0)}`} />
          <div className={`w-2.5 h-2.5 rounded-md ${getIntensityClass(1)}`} />
          <div className={`w-2.5 h-2.5 rounded-md ${getIntensityClass(2)}`} />
          <div className={`w-2.5 h-2.5 rounded-md ${getIntensityClass(3)}`} />
        </div>
        <span>high</span>
      </div>
    </div>
  );
}
