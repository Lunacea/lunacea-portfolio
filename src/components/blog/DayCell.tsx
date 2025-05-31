import React from 'react';

type DayCellProps = {
  date: string | undefined;
  count: number;
  isMonthStart: boolean;
  intensityClass: string;
  weekKey: string; // for empty cells
};

const DayCellComponent: React.FC<DayCellProps> = ({ date, count, isMonthStart, intensityClass, weekKey }) => {
  if (!date) {
    return (
      <div
        key={`empty-${weekKey}-${Math.random()}`}
        className="w-3 h-3 rounded-md bg-gradient-to-br from-muted/20 to-muted/40 shadow-inner shadow-black/5 dark:shadow-black/20 border border-black/5 dark:border-white/5"
      />
    );
  }

  let tooltipDate = '';
  try {
    const dateObj = new Date(date);
    tooltipDate = dateObj.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    // dateが無効な場合のフォールバック
    return (
      <div
        key={`invalid-${date}`}
        className="w-3 h-3 rounded-md bg-gradient-to-br from-muted/20 to-muted/40 shadow-inner shadow-black/5 dark:shadow-black/20 border border-black/5 dark:border-white/5"
      />
    );
  }

  return (
    <div
      key={date}
      className={`
        w-3 h-3 rounded-md cursor-pointer 
        transition-transform duration-300 ease-out
        will-change-transform
        shadow-sm shadow-black/5 dark:shadow-black/10
        hover:scale-125
        active:scale-110
        ${intensityClass}
        ${isMonthStart ? 'ring-1 ring-primary/60 ring-offset-1 ring-offset-background' : ''}
      `}
      title={`${tooltipDate}: ${count}記事${isMonthStart ? ' (月初)' : ''}`}
    />
  );
};

export const DayCell = React.memo(DayCellComponent);
