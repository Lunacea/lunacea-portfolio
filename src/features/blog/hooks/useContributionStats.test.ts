import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useContributionStats } from './useContributionStats';

// Fix Date to deterministic value (2025-06-10)
const fixedDate = new Date('2025-06-10T12:00:00.000Z');

describe('useContributionStats', () => {
  it('computes basic stats for given posts', () => {
    vi.setSystemTime(fixedDate);

    const posts = [
      { slug: 'a', title: 'A', publishedAt: '2025-06-01', tags: [], readingTime: '1 min' },
      { slug: 'b', title: 'B', publishedAt: '2025-06-02', tags: [], readingTime: '1 min' },
    ] as any[];

    const { result } = renderHook(() => useContributionStats(posts, 2));

    expect(result.current.totalPosts).toBe(2);
    expect(result.current.activeDays).toBeGreaterThan(0);
    expect(result.current.processedWeeks.length).toBe(2);
    // Each week has 7 day cells
    expect(result.current.processedWeeks[0]!.daysInWeek.length).toBe(7);
  });
});
