'use server';

import { analyticsEvents, blogPosts } from '@/shared/models/Schema';
import { eq, and, count, sql, gte, desc, inArray } from 'drizzle-orm';
import { logger } from '@/shared/libs/Logger';
import { getDatabase, requireAuth } from '@/shared/libs/db-common';
import 'server-only';

const { db } = getDatabase();

export interface AnalyticsEventSummary {
  totalEvents: number;
  uniquePaths: number;
  avgDuration: number;
  topPaths: Array<{ path: string; count: number; avgDuration: number | null }>;
  eventsByType: Array<{ eventType: string; count: number }>;
  recentActivity: Array<{ eventType: string; path: string; createdAt: Date }>;
}

/**
 * ユーザーの記事に関連するAnalytics Eventsを取得
 */
export async function getUserAnalyticsEvents(days = 30): Promise<AnalyticsEventSummary> {
  try {
    const userId = await requireAuth();
    
    // ユーザーの記事slugを取得
    const userPosts = await db.select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(eq(blogPosts.authorId, userId));
    
    const userSlugs = userPosts.map(p => p.slug);
    
    if (userSlugs.length === 0) {
      return {
        totalEvents: 0,
        uniquePaths: 0,
        avgDuration: 0,
        topPaths: [],
        eventsByType: [],
        recentActivity: [],
      };
    }

    // 指定日数以内のイベントを取得
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // 総イベント数
    const totalEventsResult = await db.select({ count: count() })
      .from(analyticsEvents)
      .where(
        and(
          inArray(analyticsEvents.slug, userSlugs),
          gte(analyticsEvents.createdAt, dateThreshold)
        )
      );

    const totalEvents = totalEventsResult[0]?.count || 0;

    // ユニークパス数
    const uniquePathsResult = await db.select({ 
      uniquePaths: sql<number>`COUNT(DISTINCT ${analyticsEvents.path})` 
    })
      .from(analyticsEvents)
      .where(
        and(
          inArray(analyticsEvents.slug, userSlugs),
          gte(analyticsEvents.createdAt, dateThreshold)
        )
      );

    const uniquePaths = uniquePathsResult[0]?.uniquePaths || 0;

    // 平均滞在時間（ms → 秒）
    const avgDurationResult = await db.select({ 
      avg: sql<number>`COALESCE(AVG(${analyticsEvents.durationMs}), 0)` 
    })
      .from(analyticsEvents)
      .where(
        and(
          inArray(analyticsEvents.slug, userSlugs),
          gte(analyticsEvents.createdAt, dateThreshold),
          sql`${analyticsEvents.durationMs} IS NOT NULL`
        )
      );

    const avgDuration = Math.round((avgDurationResult[0]?.avg || 0) / 1000);

    // トップパス（アクセス数順）
    const topPathsResult = await db.select({
      path: analyticsEvents.path,
      count: count(),
      avgDuration: sql<number>`AVG(${analyticsEvents.durationMs})`,
    })
      .from(analyticsEvents)
      .where(
        and(
          inArray(analyticsEvents.slug, userSlugs),
          gte(analyticsEvents.createdAt, dateThreshold)
        )
      )
      .groupBy(analyticsEvents.path)
      .orderBy(desc(count()))
      .limit(10);

    const topPaths = topPathsResult.map(p => ({
      path: p.path,
      count: p.count,
      avgDuration: p.avgDuration ? Math.round(p.avgDuration / 1000) : null,
    }));

    // イベントタイプ別
    const eventsByTypeResult = await db.select({
      eventType: analyticsEvents.eventType,
      count: count(),
    })
      .from(analyticsEvents)
      .where(
        and(
          inArray(analyticsEvents.slug, userSlugs),
          gte(analyticsEvents.createdAt, dateThreshold)
        )
      )
      .groupBy(analyticsEvents.eventType)
      .orderBy(desc(count()))
      .limit(10);

    const eventsByType = eventsByTypeResult.map(e => ({
      eventType: e.eventType,
      count: e.count,
    }));

    // 最近のアクティビティ
    const recentActivityResult = await db.select({
      eventType: analyticsEvents.eventType,
      path: analyticsEvents.path,
      createdAt: analyticsEvents.createdAt,
    })
      .from(analyticsEvents)
      .where(
        and(
          inArray(analyticsEvents.slug, userSlugs),
          gte(analyticsEvents.createdAt, dateThreshold)
        )
      )
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(20);

    return {
      totalEvents,
      uniquePaths,
      avgDuration,
      topPaths,
      eventsByType,
      recentActivity: recentActivityResult,
    };

  } catch (error) {
    logger.error({ error }, 'Analytics イベントの取得に失敗しました');
    return {
      totalEvents: 0,
      uniquePaths: 0,
      avgDuration: 0,
      topPaths: [],
      eventsByType: [],
      recentActivity: [],
    };
  }
}
