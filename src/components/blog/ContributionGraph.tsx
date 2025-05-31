import type { BlogPostMeta } from '@/lib/blog';

type ContributionGraphProps = {
  posts: BlogPostMeta[];
  weekCount?: number;
};

export function ContributionGraph({ posts, weekCount = 20 }: ContributionGraphProps) {
  // 過去N週間の日付データを生成
  const generateDateRange = () => {
    const today = new Date();
    const days = [];
    const totalDays = weekCount * 7;

    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }

    return days;
  };

  const dateRange = generateDateRange();

  // 週ごとにグループ化
  const weeks = [];
  for (let i = 0; i < dateRange.length; i += 7) {
    weeks.push(dateRange.slice(i, i + 7));
  }

  // 各日の投稿数を計算（null安全）
  const getPostCountForDate = (targetDate: string): number => {
    return posts.filter((post) => {
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

  // 投稿数に基づいて色の濃さを決定
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

  // 月ラベルを取得（その週に月の1日が含まれているかチェック）
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
      } catch {
        // エラーの場合は無視
      }
    }
    return null;
  };

  // 日付が月の初日かどうかをチェック
  const isFirstDayOfMonth = (dateStr: string): boolean => {
    try {
      const date = new Date(dateStr);
      return date.getDate() === 1;
    } catch {
      return false;
    }
  };

  const totalPosts = posts.length;
  const activeDays = dateRange.filter(date => date && getPostCountForDate(date) > 0).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          過去
          {weekCount}
          週間の更新頻度
        </span>
        <span>
          {totalPosts}
          記事 •
          {' '}
          {activeDays}
          日間活動
        </span>
      </div>

      {/* スクロール可能なコンテナ */}
      <div className="overflow-x-auto">
        <div className="flex items-start gap-1 p-3 pt-6 bg-card/30 rounded-xl border border-border/30 min-w-fit">
          {/* 曜日ラベル */}
          <div className="flex flex-col gap-1 text-xs text-muted-foreground mr-2 flex-shrink-0">
            {/* 月ラベル用のスペース */}
            <div className="h-4 flex items-end"></div>
            <div className="h-3 flex items-center">Sun</div>
            <div className="h-3 flex items-center">Mon</div>
            <div className="h-3 flex items-center">Tue</div>
            <div className="h-3 flex items-center">Wed</div>
            <div className="h-3 flex items-center">Thu</div>
            <div className="h-3 flex items-center">Fri</div>
            <div className="h-3 flex items-center">Sat</div>
          </div>

          {/* 貢献グラフ */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => {
              const monthLabel = getMonthLabel(week);
              const weekKey = week[0] || `week-${weekIndex}`;
              return (
                <div key={weekKey} className="flex flex-col gap-1 w-3">
                  {/* 月ラベルエリア */}
                  <div className="h-4 flex items-end justify-start">
                    {monthLabel && (
                      <span className="text-xs text-muted-foreground font-medium whitespace-nowrap -ml-1">
                        {monthLabel}
                      </span>
                    )}
                  </div>

                  {/* 日付のボックス */}
                  {week.map((date) => {
                    if (!date) {
                      return (
                        <div
                          key={`empty-${weekKey}-${Math.random()}`}
                          className="w-3 h-3 rounded-md bg-gradient-to-br from-muted/20 to-muted/40 shadow-inner shadow-black/5 dark:shadow-black/20 border border-black/5 dark:border-white/5"
                        />
                      );
                    }

                    const count = getPostCountForDate(date);
                    const isMonthStart = isFirstDayOfMonth(date);

                    try {
                      const dateObj = new Date(date);
                      const tooltipDate = dateObj.toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                      });

                      return (
                        <div
                          key={date}
                          className={`
                            w-3 h-3 rounded-md transition-all duration-300 ease-out cursor-pointer
                            shadow-sm shadow-black/5 dark:shadow-black/10
                            hover:scale-125 hover:shadow-md hover:shadow-black/10 dark:hover:shadow-black/20
                            active:scale-110 active:shadow-inner
                            ${getIntensityClass(count)}
                            ${isMonthStart ? 'ring-1 ring-primary/60 ring-offset-1 ring-offset-background' : ''}
                          `}
                          title={`${tooltipDate}: ${count}記事${isMonthStart ? ' (月初)' : ''}`}
                        />
                      );
                    } catch {
                      return (
                        <div
                          key={`invalid-${date}`}
                          className="w-3 h-3 rounded-md bg-gradient-to-br from-muted/20 to-muted/40 shadow-inner shadow-black/5 dark:shadow-black/20 border border-black/5 dark:border-white/5"
                        />
                      );
                    }
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>少ない</span>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-md bg-gradient-to-br from-muted/40 to-muted/60 shadow-inner shadow-black/10 dark:shadow-black/30 border border-black/5 dark:border-white/5"></div>
          <div className="w-2.5 h-2.5 rounded-md bg-gradient-to-br from-primary/40 to-primary/60 shadow-inner shadow-primary/20 dark:shadow-primary/30 border border-primary/10 dark:border-white/5"></div>
          <div className="w-2.5 h-2.5 rounded-md bg-gradient-to-br from-primary/60 to-primary/80 shadow-inner shadow-primary/30 dark:shadow-primary/40 border border-primary/15 dark:border-white/5"></div>
          <div className="w-2.5 h-2.5 rounded-md bg-gradient-to-br from-primary/80 to-primary shadow-inner shadow-primary/40 dark:shadow-primary/50 border border-primary/20 dark:border-white/5"></div>
        </div>
        <span>多い</span>
      </div>
    </div>
  );
}
