'use server';

import { comments, blogPosts } from '@/shared/models/Schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { logger } from '@/shared/libs/Logger';
import { getDatabase, requireAuth, checkAuth } from '@/shared/libs/db-common';
import { ApiResponse } from '@/shared/libs/blog-utils';
import 'server-only';

// データベース接続
const { db } = getDatabase();

export type AdminComment = {
  id: number;
  slug: string;
  author: string;
  dailyId: string;
  tripcode: string;
  parentId: number | null;
  body: string;
  isChecked: boolean;
  createdAt: Date;
};

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
 * 指定slugのコメント一覧（新しい順）
 */
export async function listCommentsBySlug(slug: string): Promise<AdminComment[]> {
  try {

    const rows = await db
      .select({
        id: comments.id,
        slug: comments.slug,
        author: comments.author,
        dailyId: comments.dailyId,
        tripcode: comments.tripcode,
        parentId: comments.parentId,
        body: comments.body,
        isChecked: comments.isChecked,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .where(eq(comments.slug, slug))
      .orderBy(desc(comments.createdAt));

    return rows as AdminComment[];
  } catch (error) {
    logger.error({ error, slug }, 'コメント一覧の取得に失敗しました');
    throw error;
  }
}

/**
 * ユーザーの記事に付いたコメント一覧
 */
export async function getUserPostComments(): Promise<CommentWithPost[]> {
  try {
    const userId = await requireAuth();

    const commentsWithPosts = await db
      .select({
        id: comments.id,
        slug: comments.slug,
        author: comments.author,
        dailyId: comments.dailyId,
        tripcode: comments.tripcode,
        parentId: comments.parentId,
        body: comments.body,
        isChecked: comments.isChecked,
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
 * 特定の記事のコメント一覧
 */
export async function getPostComments(slug: string): Promise<CommentWithPost[]> {
  try {
    const userId = await requireAuth();

    // 記事の所有権確認
    const post = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.authorId, userId)))
      .limit(1);
    if (post.length === 0) throw new Error('記事が見つからないか、権限がありません');

    const postComments = await db
      .select({
        id: comments.id,
        slug: comments.slug,
        author: comments.author,
        dailyId: comments.dailyId,
        tripcode: comments.tripcode,
        parentId: comments.parentId,
        body: comments.body,
        isChecked: comments.isChecked,
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
 * コメント統計
 */
export async function getCommentStats(): Promise<CommentStats> {
  try {
    const userId = await requireAuth();

    const totalCommentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .innerJoin(blogPosts, eq(comments.slug, blogPosts.slug))
      .where(eq(blogPosts.authorId, userId));
    const totalComments = totalCommentsResult[0]?.count || 0;

    const recentCommentsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .innerJoin(blogPosts, eq(comments.slug, blogPosts.slug))
      .where(and(eq(blogPosts.authorId, userId), sql`${comments.createdAt} >= NOW() - INTERVAL '7 days'`));
    const recentComments = recentCommentsResult[0]?.count || 0;

    const commentsByPostResult = await db
      .select({
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

    return { totalComments, recentComments, commentsByPost: commentsByPostResult };
  } catch (error) {
    logger.error({ error }, 'コメント統計情報の取得に失敗しました');
    throw error;
  }
}

/**
 * コメントを削除（記事の所有者のみ）
 */
export async function deleteComment(commentId: number): Promise<ApiResponse> {
  try {
    const authResult = await checkAuth();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const userId = authResult.userId;

    // 所有権チェック
    const commentWithPost = await db
      .select({ commentId: comments.id, slug: comments.slug, authorId: blogPosts.authorId })
      .from(comments)
      .innerJoin(blogPosts, eq(comments.slug, blogPosts.slug))
      .where(eq(comments.id, commentId))
      .limit(1);
    if (commentWithPost.length === 0) return { success: false, error: 'コメントが見つかりません' };
    if (commentWithPost[0]?.authorId !== userId) return { success: false, error: 'このコメントを削除する権限がありません' };

    await db.delete(comments).where(eq(comments.id, commentId));
    logger.info({ commentId }, 'コメントを削除しました');
    return { success: true };
  } catch (error) {
    logger.error({ error, commentId }, 'コメントの削除に失敗しました');
    return { success: false, error: 'コメントの削除中にエラーが発生しました' };
  }
}

/**
 * コメントの既読フラグ更新
 */
export async function setCommentChecked(commentId: number, checked: boolean): Promise<ApiResponse> {
  try {
    const authResult = await checkAuth();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const userId = authResult.userId;

    // 所有権チェック
    const commentWithPost = await db
      .select({ commentId: comments.id, slug: comments.slug, authorId: blogPosts.authorId })
      .from(comments)
      .innerJoin(blogPosts, eq(comments.slug, blogPosts.slug))
      .where(eq(comments.id, commentId))
      .limit(1);
    if (commentWithPost.length === 0) return { success: false, error: 'コメントが見つかりません' };
    if (commentWithPost[0]?.authorId !== userId) return { success: false, error: '権限がありません' };

    await db.update(comments).set({ isChecked: checked }).where(eq(comments.id, commentId));
    return { success: true };
  } catch (error) {
    logger.error({ error, commentId, checked }, 'コメント既読更新に失敗しました');
    return { success: false, error: '更新に失敗しました' };
  }
}

/**
 * 著者として返信（親IDを指定してコメントを作成）
 */
export async function replyToComment(parentId: number, slug: string, body: string): Promise<ApiResponse> {
  try {
    const authResult = await checkAuth();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    // 著者返信はauthor名を固定し、識別子はダミー（著者側は個人特定しない仕様）
    await db.insert(comments).values({
      slug,
      author: 'Author',
      dailyId: 'author',
      tripcode: 'author',
      parentId,
      body,
      isChecked: true,
    });

    return { success: true };
  } catch (error) {
    logger.error({ error, parentId, slug }, 'コメント返信に失敗しました');
    return { success: false, error: '返信に失敗しました' };
  }
}

/**
 * 管理者がコメントを削除（authorId所有記事に紐づくもののみ）
 */
export async function adminDeleteComment(commentId: number): Promise<ApiResponse> {
  try {
    const authResult = await checkAuth();
    if (!authResult.success) return { success: false, error: authResult.error };
    const userId = authResult.userId;

    const target = await db
      .select({ id: comments.id, slug: comments.slug, owner: blogPosts.authorId })
      .from(comments)
      .innerJoin(blogPosts, eq(comments.slug, blogPosts.slug))
      .where(eq(comments.id, commentId))
      .limit(1);
    if (target.length === 0) return { success: false, error: 'コメントが見つかりません' };
    if (target[0]?.owner !== userId) return { success: false, error: '権限がありません' };

    await db.delete(comments).where(eq(comments.id, commentId));
    logger.info({ commentId }, '管理者がコメントを削除しました');
    return { success: true };
  } catch (error) {
    logger.error({ error, commentId }, '管理者のコメント削除に失敗しました');
    return { success: false, error: '削除に失敗しました' };
  }
}

/**
 * 記事のコメントを一括削除（記事の所有者のみ）
 */
export async function deleteAllPostComments(slug: string): Promise<{ success: boolean; error?: string; deletedCount: number }> {
  try {
    const authResult = await checkAuth();
    if (!authResult.success) {
      return { success: false, error: authResult.error, deletedCount: 0 };
    }
    const userId = authResult.userId;

    const post = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.authorId, userId)))
      .limit(1);
    if (post.length === 0) return { success: false, error: '記事が見つからないか、権限がありません', deletedCount: 0 };

    const commentCountResult = await db.select({ count: sql<number>`count(*)` }).from(comments).where(eq(comments.slug, slug));
    const commentCount = commentCountResult[0]?.count || 0;

    await db.delete(comments).where(eq(comments.slug, slug));
    logger.info({ slug, deletedCount: commentCount }, '記事のコメントを一括削除しました');
    return { success: true, deletedCount: commentCount };
  } catch (error) {
    logger.error({ error, slug }, '記事のコメント一括削除に失敗しました');
    return { success: false, error: 'コメントの一括削除中にエラーが発生しました', deletedCount: 0 };
  }
}
