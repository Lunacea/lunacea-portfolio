'use server';

import { auth } from '@/shared/libs/auth-server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { blogPosts, blogPostVersions } from '@/shared/models/Schema';
import { eq, and, count, sql } from 'drizzle-orm';
import { logger } from '@/shared/libs/Logger';
import 'server-only';

// データベース接続
const client = postgres(process.env.DATABASE_URL as string);
const db = drizzle(client);

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalVersions: number;
  averageReadingTime: number;
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

/**
 * ユーザーのブログ統計情報を取得
 */
export async function getUserBlogStats(): Promise<BlogStats> {
  try {
    // 認証チェック
    const authResult = await auth();
    if (!authResult?.userId) {
      throw new Error('認証が必要です');
    }
    const userId = authResult.userId;

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

    const totalPosts = totalPostsResult[0]?.count || 0;
    const publishedPosts = publishedPostsResult[0]?.count || 0;
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
    const averageReadingTime = Math.round(readingTimeResult[0]?.averageReadingTime || 0);

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

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews,
      totalVersions,
      averageReadingTime,
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
    const authResult = await auth();
    if (!authResult?.userId) {
      throw new Error('認証が必要です');
    }
    const userId = authResult.userId;

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
