'use server';

import { blogPosts } from '@/shared/models/Schema';
import { eq, sql, desc } from 'drizzle-orm';
import { logger } from '@/shared/libs/Logger';
import { getDatabase, requireAuth, checkAuth } from '@/shared/libs/db-common';
import 'server-only';

// データベース接続
const { db } = getDatabase();

export interface CategoryStats {
  tag: string;
  count: number;
  publishedCount: number;
  draftCount: number;
  totalViews: number;
  averageReadingTime: number;
  recentPosts: Array<{
    id: number;
    title: string;
    slug: string;
    status: string;
    updatedAt: Date;
  }>;
}

/**
 * すべてのカテゴリ（タグ）の統計情報を取得
 */
export async function getAllCategoryStats(): Promise<CategoryStats[]> {
  try {
    // 認証チェック
    const userId = await requireAuth();

    // タグごとの統計情報を取得
    const tagStats = await db.select({
      tag: sql<string>`unnest(${blogPosts.tags})`,
      count: sql<number>`count(*)`,
      publishedCount: sql<number>`count(*) FILTER (WHERE ${blogPosts.status} = 'published')`,
      draftCount: sql<number>`count(*) FILTER (WHERE ${blogPosts.status} = 'draft')`,
      totalViews: sql<number>`COALESCE(SUM(${blogPosts.viewCount}), 0)`,
      averageReadingTime: sql<number>`COALESCE(AVG(${blogPosts.readingTime}), 0)`,
    })
      .from(blogPosts)
      .where(eq(blogPosts.authorId, userId))
      .groupBy(sql`unnest(${blogPosts.tags})`)
      .orderBy(sql`count(*) DESC`);

    // 各タグの最近の記事を取得
    const categoryStatsWithPosts: CategoryStats[] = [];
    
    for (const stat of tagStats) {
      const recentPosts = await db.select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        status: blogPosts.status,
        updatedAt: blogPosts.updatedAt,
      })
        .from(blogPosts)
        .where(
          sql`${blogPosts.authorId} = ${userId} AND ${stat.tag} = ANY(${blogPosts.tags})`
        )
        .orderBy(desc(blogPosts.updatedAt))
        .limit(3);

      categoryStatsWithPosts.push({
        tag: stat.tag,
        count: stat.count,
        publishedCount: stat.publishedCount,
        draftCount: stat.draftCount,
        totalViews: stat.totalViews,
        averageReadingTime: Math.round(stat.averageReadingTime),
        recentPosts,
      });
    }

    return categoryStatsWithPosts;

  } catch (error) {
    logger.error({ error }, 'カテゴリ統計情報の取得に失敗しました');
    throw error;
  }
}

/**
 * 特定のカテゴリの詳細統計を取得
 */
export async function getCategoryDetailStats(tag: string): Promise<{
  tag: string;
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  averageReadingTime: number;
  posts: Array<{
    id: number;
    title: string;
    slug: string;
    status: string;
    description: string | null;
    updatedAt: Date;
    viewCount: number;
    readingTime: number | null;
  }>;
}> {
  try {
    // 認証チェック
    const userId = await requireAuth();

    // 基本統計の取得
    const [statsResult, postsResult] = await Promise.all([
      db.select({
        totalPosts: sql<number>`count(*)`,
        publishedPosts: sql<number>`count(*) FILTER (WHERE ${blogPosts.status} = 'published')`,
        draftPosts: sql<number>`count(*) FILTER (WHERE ${blogPosts.status} = 'draft')`,
        totalViews: sql<number>`COALESCE(SUM(${blogPosts.viewCount}), 0)`,
        averageReadingTime: sql<number>`COALESCE(AVG(${blogPosts.readingTime}), 0)`,
      })
        .from(blogPosts)
        .where(
          sql`${blogPosts.authorId} = ${userId} AND ${tag} = ANY(${blogPosts.tags})`
        ),
      
      db.select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        status: blogPosts.status,
        description: blogPosts.description,
        updatedAt: blogPosts.updatedAt,
        viewCount: blogPosts.viewCount,
        readingTime: blogPosts.readingTime,
      })
        .from(blogPosts)
        .where(
          sql`${blogPosts.authorId} = ${userId} AND ${tag} = ANY(${blogPosts.tags})`
        )
        .orderBy(desc(blogPosts.updatedAt)),
    ]);

    const stats = statsResult[0];
    if (!stats) {
      throw new Error('カテゴリが見つかりません');
    }

    return {
      tag,
      totalPosts: stats.totalPosts,
      publishedPosts: stats.publishedPosts,
      draftPosts: stats.draftPosts,
      totalViews: stats.totalViews,
      averageReadingTime: Math.round(stats.averageReadingTime),
      posts: postsResult,
    };

  } catch (error) {
    logger.error({ error, tag }, 'カテゴリ詳細統計の取得に失敗しました');
    throw error;
  }
}

/**
 * カテゴリ名を変更（すべての記事のタグを更新）
 */
export async function renameCategory(oldTag: string, newTag: string): Promise<{ success: boolean; error?: string; updatedPosts: number }> {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if (!authResult.success) {
      return { success: false, error: authResult.error, updatedPosts: 0 };
    }
    const userId = authResult.userId;

    // 新しいタグ名の重複チェック
    const existingTag = await db.select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(
        sql`${blogPosts.authorId} = ${userId} AND ${newTag} = ANY(${blogPosts.tags})`
      );

    if (existingTag[0] && existingTag[0].count > 0) {
      return { success: false, error: '新しいタグ名は既に存在します', updatedPosts: 0 };
    }

    // タグを更新
    await db.update(blogPosts)
      .set({
        tags: sql`array_replace(${blogPosts.tags}, ${oldTag}, ${newTag})`,
        updatedAt: new Date(),
      })
      .where(
        sql`${blogPosts.authorId} = ${userId} AND ${oldTag} = ANY(${blogPosts.tags})`
      );

    logger.info({ oldTag, newTag }, 'カテゴリ名を変更しました');

    return { success: true, updatedPosts: 1 }; // TODO: 実際の更新件数を取得

  } catch (error) {
    logger.error({ error, oldTag, newTag }, 'カテゴリ名の変更に失敗しました');
    return { 
      success: false, 
      error: 'カテゴリ名の変更中にエラーが発生しました', 
      updatedPosts: 0 
    };
  }
}

/**
 * カテゴリを削除（すべての記事からタグを削除）
 */
export async function deleteCategory(tag: string): Promise<{ success: boolean; error?: string; updatedPosts: number }> {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if (!authResult.success) {
      return { success: false, error: authResult.error, updatedPosts: 0 };
    }
    const userId = authResult.userId;

    // タグを削除
    await db.update(blogPosts)
      .set({
        tags: sql`array_remove(${blogPosts.tags}, ${tag})`,
        updatedAt: new Date(),
      })
      .where(
        sql`${blogPosts.authorId} = ${userId} AND ${tag} = ANY(${blogPosts.tags})`
      );

    logger.info({ tag }, 'カテゴリを削除しました');

    return { success: true, updatedPosts: 1 }; // TODO: 実際の更新件数を取得

  } catch (error) {
    logger.error({ error, tag }, 'カテゴリの削除に失敗しました');
    return { 
      success: false, 
      error: 'カテゴリの削除中にエラーが発生しました', 
      updatedPosts: 0 
    };
  }
}
