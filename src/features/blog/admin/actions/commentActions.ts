'use server';

import { auth } from '@/shared/libs/auth-server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { comments, blogPosts } from '@/shared/models/Schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { logger } from '@/shared/libs/Logger';
import 'server-only';

// データベース接続
const client = postgres(process.env.DATABASE_URL as string);
const db = drizzle(client);

export interface CommentWithPost {
  id: number;
  slug: string;
  author: string;
  dailyId: string;
  tripcode: string;
  parentId: number | null;
  body: string;
  createdAt: Date;
  postTitle: string;
  postStatus: string;
}

export interface CommentStats {
  totalComments: number;
  recentComments: number;
  commentsByPost: Array<{
    slug: string;
    title: string;
    status: string;
    commentCount: number;
    lastCommentAt: Date | null;
  }>;
}

/**
 * ユーザーの記事のコメント一覧を取得
 */
export async function getUserPostComments(): Promise<CommentWithPost[]> {
  try {
    // 認証チェック
    const authResult = await auth();
    if (!authResult?.userId) {
      throw new Error('認証が必要です');
    }
    const userId = authResult.userId;

    // ユーザーの記事のコメントを取得
    const commentsWithPosts = await db.select({
      id: comments.id,
      slug: comments.slug,
      author: comments.author,
      dailyId: comments.dailyId,
      tripcode: comments.tripcode,
      parentId: comments.parentId,
      body: comments.body,
      createdAt: comments.createdAt,
      postTitle: blogPosts.title,
      postStatus: blogPosts.status,
    })
      .from(comments)
      .innerJoin(blogPosts, eq(comments.slug, blogPosts.slug))
      .where(eq(blogPosts.authorId, userId))
      .orderBy(desc(comments.createdAt));

    return commentsWithPosts;

  } catch (error) {
    logger.error({ error }, 'ユーザー記事のコメント取得に失敗しました');
    throw error;
  }
}

/**
 * 特定の記事のコメント一覧を取得
 */
export async function getPostComments(slug: string): Promise<CommentWithPost[]> {
  try {
    // 認証チェック
    const authResult = await auth();
    if (!authResult?.userId) {
      throw new Error('認証が必要です');
    }
    const userId = authResult.userId;

    // 記事の所有権確認
    const post = await db.select()
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.authorId, userId)
        )
      )
      .limit(1);

    if (post.length === 0) {
      throw new Error('記事が見つからないか、権限がありません');
    }

    // 記事のコメントを取得
    const postComments = await db.select({
      id: comments.id,
      slug: comments.slug,
      author: comments.author,
      dailyId: comments.dailyId,
      tripcode: comments.tripcode,
      parentId: comments.parentId,
      body: comments.body,
      createdAt: comments.createdAt,
      postTitle: blogPosts.title,
      postStatus: blogPosts.status,
    })
      .from(comments)
      .innerJoin(blogPosts, eq(comments.slug, blogPosts.slug))
      .where(eq(comments.slug, slug))
      .orderBy(desc(comments.createdAt));

    return postComments;

  } catch (error) {
    logger.error({ error, slug }, '記事のコメント取得に失敗しました');
    throw error;
  }
}

/**
 * コメント統計情報を取得
 */
export async function getCommentStats(): Promise<CommentStats> {
  try {
    // 認証チェック
    const authResult = await auth();
    if (!authResult?.userId) {
      throw new Error('認証が必要です');
    }
    const userId = authResult.userId;

    // 総コメント数
    const totalCommentsResult = await db.select({
      count: sql<number>`count(*)`,
    })
      .from(comments)
      .innerJoin(blogPosts, eq(comments.slug, blogPosts.slug))
      .where(eq(blogPosts.authorId, userId));

    const totalComments = totalCommentsResult[0]?.count || 0;

    // 最近のコメント数（過去7日）
    const recentCommentsResult = await db.select({
      count: sql<number>`count(*)`,
    })
      .from(comments)
      .innerJoin(blogPosts, eq(comments.slug, blogPosts.slug))
      .where(
        and(
          eq(blogPosts.authorId, userId),
          sql`${comments.createdAt} >= NOW() - INTERVAL '7 days'`
        )
      );

    const recentComments = recentCommentsResult[0]?.count || 0;

    // 記事ごとのコメント数
    const commentsByPostResult = await db.select({
      slug: blogPosts.slug,
      title: blogPosts.title,
      status: blogPosts.status,
      commentCount: sql<number>`count(${comments.id})`,
      lastCommentAt: sql<Date | null>`MAX(${comments.createdAt})`,
    })
      .from(blogPosts)
      .leftJoin(comments, eq(blogPosts.slug, comments.slug))
      .where(eq(blogPosts.authorId, userId))
      .groupBy(blogPosts.slug, blogPosts.title, blogPosts.status)
      .orderBy(sql`count(${comments.id}) DESC`);

    return {
      totalComments,
      recentComments,
      commentsByPost: commentsByPostResult,
    };

  } catch (error) {
    logger.error({ error }, 'コメント統計情報の取得に失敗しました');
    throw error;
  }
}

/**
 * コメントを削除
 */
export async function deleteComment(commentId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // 認証チェック
    const authResult = await auth();
    if (!authResult?.userId) {
      return { success: false, error: '認証が必要です' };
    }
    const userId = authResult.userId;

    // コメントの記事の所有権確認
    const commentWithPost = await db.select({
      commentId: comments.id,
      slug: comments.slug,
      authorId: blogPosts.authorId,
    })
      .from(comments)
      .innerJoin(blogPosts, eq(comments.slug, blogPosts.slug))
      .where(eq(comments.id, commentId))
      .limit(1);

    if (commentWithPost.length === 0) {
      return { success: false, error: 'コメントが見つかりません' };
    }

    if (commentWithPost[0]?.authorId !== userId) {
      return { success: false, error: 'このコメントを削除する権限がありません' };
    }

    // コメントを削除
    await db.delete(comments).where(eq(comments.id, commentId));

    logger.info({ commentId }, 'コメントを削除しました');

    return { success: true };

  } catch (error) {
    logger.error({ error, commentId }, 'コメントの削除に失敗しました');
    return { 
      success: false, 
      error: 'コメントの削除中にエラーが発生しました' 
    };
  }
}

/**
 * 記事のコメントを一括削除
 */
export async function deleteAllPostComments(slug: string): Promise<{
  success: boolean;
  error?: string;
  deletedCount: number;
}> {
  try {
    // 認証チェック
    const authResult = await auth();
    if (!authResult?.userId) {
      return { success: false, error: '認証が必要です', deletedCount: 0 };
    }
    const userId = authResult.userId;

    // 記事の所有権確認
    const post = await db.select()
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.authorId, userId)
        )
      )
      .limit(1);

    if (post.length === 0) {
      return { success: false, error: '記事が見つからないか、権限がありません', deletedCount: 0 };
    }

    // 記事のコメント数を取得
    const commentCountResult = await db.select({
      count: sql<number>`count(*)`,
    })
      .from(comments)
      .where(eq(comments.slug, slug));

    const commentCount = commentCountResult[0]?.count || 0;

    // 記事のコメントを一括削除
    await db.delete(comments).where(eq(comments.slug, slug));

    logger.info({ slug, deletedCount: commentCount }, '記事のコメントを一括削除しました');

    return { success: true, deletedCount: commentCount };

  } catch (error) {
    logger.error({ error, slug }, '記事のコメント一括削除に失敗しました');
    return { 
      success: false, 
      error: 'コメントの一括削除中にエラーが発生しました', 
      deletedCount: 0 
    };
  }
}
