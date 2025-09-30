'use server';

import { blogPosts, blogPostVersions, postRatingVotes, postViewEvents, comments } from '@/shared/models/Schema';
import { getAllBlogPosts } from '@/shared/libs/blog.impl';
import { eq, and, count, sql, inArray } from 'drizzle-orm';
import { logger } from '@/shared/libs/Logger';
import { getDatabase, requireAuth } from '@/shared/libs/db-common';
import 'server-only';

// データベース接続
const { db } = getDatabase();

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalVersions: number;
  averageReadingTime: number;
  postsByDay: Array<{ date: string; count: number }>;
  mostViewedPost?: {
    id: number;
    title: string;
    slug: string;
    viewCount: number;
  };
  recentPosts: Array<{
    id: number;
    title: string;
    slug: string;
    status: string;
    updatedAt: Date;
    viewCount: number;
  }>;
}

export interface PostLikeCount {
  postId: number;
  slug: string;
  likeCount: number;
}

export interface ViewsTrendPoint { date: string; views: number; cumulative: number }
export interface LikeTrendPoint { date: string; likes: number }
export interface RankedPost { id: number; slug: string; title: string; viewCount: number; likes: number }
export interface RecentCommentItem { id: number; slug: string; author: string; body: string; createdAt: Date }

// Analytics Events 用の型
export interface AnalyticsEventSummary {
  totalEvents: number
  uniquePaths: number
  avgDuration: number
  topPaths: Array<{ path: string; count: number; avgDuration: number }>
  eventsByType: Array<{ eventType: string; count: number }>
  recentActivity: Array<{ eventType: string; path: string; createdAt: Date }>
}

/**
 * ユーザーのブログ統計情報を取得
 */
export async function getUserBlogStats(): Promise<BlogStats> {
  try {
    // 認証チェック
    const userId = await requireAuth();

    // FS側の記事（MDX）を一度だけ取得して使い回す
    let fsPosts: Awaited<ReturnType<typeof getAllBlogPosts>> = [];
    try {
      fsPosts = await getAllBlogPosts();
    } catch {}

    // 基本統計の取得
    const [totalPostsResult, publishedPostsResult, draftPostsResult] = await Promise.all([
      db.select({ count: count() })
        .from(blogPosts)
        .where(eq(blogPosts.authorId, userId)),
      
      db.select({ count: count() })
        .from(blogPosts)
        .where(
          and(
            eq(blogPosts.authorId, userId),
            eq(blogPosts.status, 'published')
          )
        ),
      
      db.select({ count: count() })
        .from(blogPosts)
        .where(
          and(
            eq(blogPosts.authorId, userId),
            eq(blogPosts.status, 'draft')
          )
        ),
    ]);

    let totalPosts = totalPostsResult[0]?.count || 0;
    let publishedPosts = publishedPostsResult[0]?.count || 0;
    const draftPosts = draftPostsResult[0]?.count || 0;

    // 総閲覧数と平均読了時間の取得
    const [viewsResult, readingTimeResult] = await Promise.all([
      db.select({ 
        totalViews: sql<number>`COALESCE(SUM(${blogPosts.viewCount}), 0)`,
      })
        .from(blogPosts)
        .where(eq(blogPosts.authorId, userId)),
      
      db.select({ 
        averageReadingTime: sql<number>`COALESCE(AVG(${blogPosts.readingTime}), 0)`,
      })
        .from(blogPosts)
        .where(eq(blogPosts.authorId, userId)),
    ]);

    const totalViews = viewsResult[0]?.totalViews || 0;
    let averageReadingTime = Math.round(readingTimeResult[0]?.averageReadingTime || 0);

    // ファイルシステム(@content)の記事も統計に含める（ビューは除外）
    if (fsPosts.length > 0) {
      totalPosts += fsPosts.length;
      publishedPosts += fsPosts.length;
      const fileReadingTimes = fsPosts
        .map(p => {
          const m = (p.readingTime || '').toString().match(/(\d+)/);
          return m ? Number(m[1]) : 0;
        })
        .filter(n => Number.isFinite(n));
      if (fileReadingTimes.length > 0) {
        const dbAvg = averageReadingTime;
        const dbCount = (totalPosts - fsPosts.length) || 0;
        const fileAvg = Math.round(fileReadingTimes.reduce((a,b)=>a+b,0) / fileReadingTimes.length);
        const combinedCount = dbCount + fileReadingTimes.length;
        averageReadingTime = combinedCount > 0 ? Math.round(((dbAvg * dbCount) + (fileAvg * fileReadingTimes.length)) / combinedCount) : fileAvg;
      }
    }

    // バージョン数の取得
    const versionsResult = await db.select({ count: count() })
      .from(blogPostVersions)
      .innerJoin(blogPosts, eq(blogPostVersions.postId, blogPosts.id))
      .where(eq(blogPosts.authorId, userId));

    const totalVersions = versionsResult[0]?.count || 0;

    // 最も閲覧された記事の取得
    const mostViewedResult = await db.select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      viewCount: blogPosts.viewCount,
    })
      .from(blogPosts)
      .where(eq(blogPosts.authorId, userId))
      .orderBy(sql`${blogPosts.viewCount} DESC`)
      .limit(1);

    const mostViewedPost = mostViewedResult.length > 0 ? mostViewedResult[0] : undefined;

    // 最近の記事の取得
    const recentPostsResult = await db.select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      status: blogPosts.status,
      updatedAt: blogPosts.updatedAt,
      viewCount: blogPosts.viewCount,
    })
      .from(blogPosts)
      .where(eq(blogPosts.authorId, userId))
      .orderBy(sql`${blogPosts.updatedAt} DESC`)
      .limit(5);

    // 投稿数の時系列（直近30日）: DB + FS
    const today = new Date();
    const days: Array<{ date: string; count: number }> = [];
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    // DB: 公開済み記事のpublishedAtを取得
    const dbPublished = await db.select({ publishedAt: blogPosts.publishedAt })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.authorId, userId),
          eq(blogPosts.status, 'published')
        )
      );
    const countsMap = new Map<string, number>();
    const inc = (key: string) => countsMap.set(key, (countsMap.get(key) || 0) + 1);
    dbPublished.forEach(p => { if (p.publishedAt) inc(fmt(new Date(p.publishedAt))); });
    fsPosts.forEach(p => { if (p.publishedAt) inc(fmt(new Date(p.publishedAt))); });
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = fmt(d);
      days.push({ date: key, count: countsMap.get(key) || 0 });
    }

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalVersions,
      averageReadingTime,
      postsByDay: days,
      mostViewedPost,
      recentPosts: recentPostsResult,
    };

  } catch (error) {
    logger.error({ error }, 'ブログ統計情報の取得に失敗しました');
    throw error;
  }
}

/**
 * 特定の記事の統計情報を取得
 */
export async function getPostStats(postId: number): Promise<{
  viewCount: number;
  readingTime: number;
  versionCount: number;
  lastUpdated: Date;
  createdAt: Date;
}> {
  try {
    // 認証チェック
    const userId = await requireAuth();

    // 記事の存在確認と権限チェック
    const post = await db.select({
      viewCount: blogPosts.viewCount,
      readingTime: blogPosts.readingTime,
      updatedAt: blogPosts.updatedAt,
      createdAt: blogPosts.createdAt,
    })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.id, postId),
          eq(blogPosts.authorId, userId)
        )
      )
      .limit(1);

    if (post.length === 0) {
      throw new Error('記事が見つかりません');
    }

    // バージョン数の取得
    const versionsResult = await db.select({ count: count() })
      .from(blogPostVersions)
      .where(eq(blogPostVersions.postId, postId));

    return {
      viewCount: post[0]?.viewCount || 0,
      readingTime: post[0]?.readingTime || 0,
      versionCount: versionsResult[0]?.count || 0,
      lastUpdated: post[0]?.updatedAt || new Date(),
      createdAt: post[0]?.createdAt || new Date(),
    };

  } catch (error) {
    logger.error({ error, postId }, '記事統計情報の取得に失敗しました');
    throw error;
  }
}

/**
 * ユーザーの記事のいいね数を取得
 */
export async function getPostLikeCounts(): Promise<PostLikeCount[]> {
  try {
    // 認証チェック
    const userId = await requireAuth();

    // ユーザーの記事のいいね数を取得
    const likeCounts = await db.select({
      postId: blogPosts.id,
      slug: blogPosts.slug,
      likeCount: sql<number>`COALESCE(COUNT(CASE WHEN ${postRatingVotes.voteValue} = 'up' THEN 1 END), 0)`,
    })
      .from(blogPosts)
      .leftJoin(postRatingVotes, eq(blogPosts.slug, postRatingVotes.slug))
      .where(eq(blogPosts.authorId, userId))
      .groupBy(blogPosts.id, blogPosts.slug)
      .orderBy(sql`${blogPosts.id} DESC`);

    return likeCounts;

  } catch (error) {
    logger.error({ error }, '記事のいいね数取得に失敗しました');
    throw error;
  }
}

/**
 * 閲覧推移（日次）: 直近rangeDays（日）
 */
export async function getViewsTrend(rangeDays = 30): Promise<ViewsTrendPoint[]> {
  try {
    const userId = await requireAuth();
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - (rangeDays - 1));
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    // 著者のスラッグ集合を取得
    const slugsRows = await db.select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(eq(blogPosts.authorId, userId));
    const slugSet = new Set(slugsRows.map(s => s.slug));
    if (slugSet.size === 0) return [];

    // イベントを取得
    const events = await db.select({ slug: postViewEvents.slug, viewDay: postViewEvents.viewDay })
      .from(postViewEvents)
      .where(sql`${postViewEvents.viewDay} >= ${fmt(start)}`);

    // 著者の分のみ集計
    const dayMap = new Map<string, number>();
    for (const ev of events) {
      if (!slugSet.has(ev.slug)) continue;
      dayMap.set(ev.viewDay, (dayMap.get(ev.viewDay) || 0) + 1);
    }

    const out: ViewsTrendPoint[] = [];
    let cum = 0;
    for (let i = 0; i < rangeDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = fmt(d);
      const views = dayMap.get(key) || 0;
      cum += views;
      out.push({ date: key, views, cumulative: cum });
    }
    return out;
  } catch (error) {
    logger.error({ error, rangeDays }, '閲覧推移の取得に失敗');
    throw error;
  }
}

/**
 * いいね推移（日次）: 直近rangeDays（日）
 */
export async function getLikeTrend(rangeDays = 30): Promise<LikeTrendPoint[]> {
  try {
    const userId = await requireAuth();
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - (rangeDays - 1));
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const slugsRows = await db.select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(eq(blogPosts.authorId, userId));
    const slugSet = new Set(slugsRows.map(s => s.slug));
    if (slugSet.size === 0) return [];

    const likesRows = await db.select({ voteDay: postRatingVotes.voteDay, voteValue: postRatingVotes.voteValue, slug: postRatingVotes.slug })
      .from(postRatingVotes)
      .where(sql`${postRatingVotes.voteDay} >= ${fmt(start)}`);

    const dayMap = new Map<string, number>();
    for (const r of likesRows) {
      if (!slugSet.has(r.slug)) continue;
      if (r.voteValue !== 'up') continue;
      dayMap.set(r.voteDay, (dayMap.get(r.voteDay) || 0) + 1);
    }

    const out: LikeTrendPoint[] = [];
    for (let i = 0; i < rangeDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = fmt(d);
      out.push({ date: key, likes: dayMap.get(key) || 0 });
    }
    return out;
  } catch (error) {
    logger.error({ error, rangeDays }, 'いいね推移の取得に失敗');
    throw error;
  }
}

/**
 * 人気記事ランキング（ビュー+いいね）
 */
export async function getPopularPosts(limit = 10): Promise<RankedPost[]> {
  try {
    const userId = await requireAuth();

    // ベース: viewCountの多い順
    const base = await db.select({ id: blogPosts.id, slug: blogPosts.slug, title: blogPosts.title, viewCount: blogPosts.viewCount })
      .from(blogPosts)
      .where(eq(blogPosts.authorId, userId))
      .orderBy(sql`${blogPosts.viewCount} DESC`)
      .limit(limit * 2);

    const slugs = base.map(b => b.slug);
    if (slugs.length === 0) return [];

    // いいね数を取得
    const likeRows = await db.select({ slug: postRatingVotes.slug, likes: sql<number>`COUNT(*)` })
      .from(postRatingVotes)
      .where(and(inArray(postRatingVotes.slug, slugs), eq(postRatingVotes.voteValue, 'up')))
      .groupBy(postRatingVotes.slug);
    const likeMap = new Map<string, number>();
    likeRows.forEach(r => likeMap.set(r.slug, r.likes));

    const merged: RankedPost[] = base.map(b => ({ id: b.id, slug: b.slug, title: b.title, viewCount: b.viewCount, likes: likeMap.get(b.slug) || 0 }));
    // 二次ソート: likes DESC then viewCount DESC
    merged.sort((a, b) => (b.likes - a.likes) || (b.viewCount - a.viewCount));
    return merged.slice(0, limit);
  } catch (error) {
    logger.error({ error, limit }, '人気記事ランキングの取得に失敗');
    throw error;
  }
}

/**
 * 最近のコメント一覧
 */
export async function getRecentComments(limit = 10): Promise<RecentCommentItem[]> {
  try {
    const userId = await requireAuth();
    const rows = await db.select({
      id: comments.id,
      slug: comments.slug,
      author: comments.author,
      body: comments.body,
      createdAt: comments.createdAt,
    })
      .from(comments)
      .innerJoin(blogPosts, eq(comments.slug, blogPosts.slug))
      .where(eq(blogPosts.authorId, userId))
      .orderBy(sql`${comments.createdAt} DESC`)
      .limit(limit);
    return rows;
  } catch (error) {
    logger.error({ error, limit }, '最近コメントの取得に失敗');
    throw error;
  }
}

/**
 * 指定した記事ID群のいいね数を一括取得（N+1回避）
 */
export async function getLikeCountsForPostIds(postIds: number[]): Promise<PostLikeCount[]> {
  try {
    const userId = await requireAuth();

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return [];
    }

    const likeCounts = await db.select({
      postId: blogPosts.id,
      slug: blogPosts.slug,
      likeCount: sql<number>`COALESCE(COUNT(CASE WHEN ${postRatingVotes.voteValue} = 'up' THEN 1 END), 0)`,
    })
      .from(blogPosts)
      .leftJoin(postRatingVotes, eq(blogPosts.slug, postRatingVotes.slug))
      .where(
        and(
          eq(blogPosts.authorId, userId),
          inArray(blogPosts.id, postIds)
        )
      )
      .groupBy(blogPosts.id, blogPosts.slug)
      .orderBy(sql`${blogPosts.id} DESC`);

    return likeCounts;
  } catch (error) {
    logger.error({ error, postIds }, '記事ID群のいいね数取得に失敗しました');
    throw error;
  }
}

/**
 * 特定の記事のいいね数を取得
 */
export async function getPostLikeCount(postId: number): Promise<number> {
  try {
    // 認証チェック
    const userId = await requireAuth();

    // 記事の存在確認と権限チェック
    const post = await db.select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.id, postId),
          eq(blogPosts.authorId, userId)
        )
      )
      .limit(1);

    if (post.length === 0 || !post[0]) {
      throw new Error('記事が見つかりません');
    }

    // いいね数を取得
    const likeCountResult = await db.select({
      likeCount: sql<number>`COALESCE(COUNT(CASE WHEN ${postRatingVotes.voteValue} = 'up' THEN 1 END), 0)`,
    })
      .from(postRatingVotes)
      .where(eq(postRatingVotes.slug, post[0].slug));

    return likeCountResult[0]?.likeCount || 0;

  } catch (error) {
    logger.error({ error, postId }, '記事のいいね数取得に失敗しました');
    throw error;
  }
}
