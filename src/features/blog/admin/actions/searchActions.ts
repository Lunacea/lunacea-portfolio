'use server';

import { blogPosts } from '@/shared/models/Schema';
import { eq, and, or, ilike, desc, sql } from 'drizzle-orm';
import { logger } from '@/shared/libs/Logger';
import { getDatabase, requireAuth, checkAuth } from '@/shared/libs/db-common';
import 'server-only';

// データベース接続
const { db } = getDatabase();

export interface SearchResult {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  excerpt: string | null;
  status: string;
  tags: string[] | null;
  updatedAt: Date;
  viewCount: number;
  readingTime: number | null;
}

export interface SearchOptions {
  query?: string;
  status?: 'draft' | 'published' | 'all';
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * 記事を検索
 */
export async function searchBlogPosts(options: SearchOptions = {}): Promise<{
  results: SearchResult[];
  total: number;
  hasMore: boolean;
}> {
  try {
    // 認証チェック
    const userId = await requireAuth();

    const {
      query = '',
      status = 'all',
      tags = [],
      limit = 20,
      offset = 0,
    } = options;

    // 検索条件の構築
    const conditions = [eq(blogPosts.authorId, userId)];

    // ステータスフィルター
    if (status !== 'all') {
      conditions.push(eq(blogPosts.status, status));
    }

    // テキスト検索
    if (query.trim()) {
      const searchTerm = `%${query.trim()}%`;
      const searchCondition = or(
        ilike(blogPosts.title, searchTerm),
        ilike(blogPosts.description, searchTerm),
        ilike(blogPosts.content, searchTerm),
        ilike(blogPosts.excerpt, searchTerm)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // タグフィルター
    if (tags.length > 0) {
      // PostgreSQLの配列演算子を使用
      conditions.push(sql`${blogPosts.tags} && ${tags}`);
    }

    // 検索結果の取得
    const results = await db.select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      description: blogPosts.description,
      excerpt: blogPosts.excerpt,
      status: blogPosts.status,
      tags: blogPosts.tags,
      updatedAt: blogPosts.updatedAt,
      viewCount: blogPosts.viewCount,
      readingTime: blogPosts.readingTime,
    })
      .from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.updatedAt))
      .limit(limit + 1) // hasMore判定のため+1
      .offset(offset);

    // 総数の取得
    const totalResult = await db.select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(and(...conditions));

    const total = totalResult[0]?.count || 0;
    const hasMore = results.length > limit;
    const finalResults = hasMore ? results.slice(0, limit) : results;

    logger.info({ 
      query, 
      status, 
      tags, 
      resultsCount: finalResults.length, 
      total 
    }, '記事検索を実行しました');

    return {
      results: finalResults,
      total,
      hasMore,
    };

  } catch (error) {
    logger.error({ error, options }, '記事検索に失敗しました');
    throw error;
  }
}

/**
 * 検索候補（タイトル）を取得
 */
export async function getSearchSuggestions(query: string, limit = 10): Promise<string[]> {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if (!authResult.success) {
      return [];
    }
    const userId = authResult.userId;

    if (!query.trim()) {
      return [];
    }

    const searchTerm = `%${query.trim()}%`;
    
    const suggestions = await db.select({ title: blogPosts.title })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.authorId, userId),
          ilike(blogPosts.title, searchTerm)
        )
      )
      .limit(limit);

    return suggestions.map(s => s.title);

  } catch (error) {
    logger.error({ error, query }, '検索候補の取得に失敗しました');
    return [];
  }
}

/**
 * 人気のタグを取得
 */
export async function getPopularTags(limit = 20): Promise<Array<{ tag: string; count: number }>> {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if (!authResult.success) {
      return [];
    }
    const userId = authResult.userId;

    // PostgreSQLの配列展開と集計を使用
    const tagStats = await db.select({
      tag: sql<string>`unnest(${blogPosts.tags})`,
      count: sql<number>`count(*)`,
    })
      .from(blogPosts)
      .where(eq(blogPosts.authorId, userId))
      .groupBy(sql`unnest(${blogPosts.tags})`)
      .orderBy(sql`count(*) DESC`)
      .limit(limit);

    return tagStats.map(stat => ({
      tag: stat.tag,
      count: stat.count,
    }));

  } catch (error) {
    logger.error({ error }, '人気タグの取得に失敗しました');
    return [];
  }
}
