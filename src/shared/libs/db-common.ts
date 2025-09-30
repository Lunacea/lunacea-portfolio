import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { auth } from '@/shared/libs/auth-server';
import { logger } from '@/shared/libs/Logger';
import 'server-only';

// データベース接続（シングルトンパターン）
let client: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!client) {
    client = postgres(process.env.DATABASE_URL as string);
    db = drizzle(client);
  }
  if (!db) {
    throw new Error('データベース接続の初期化に失敗しました');
  }
  return { client, db };
}

// 認証チェックの共通関数
export async function requireAuth() {
  const authResult = await auth();
  if (!authResult?.userId) {
    throw new Error('認証が必要です');
  }
  return authResult.userId;
}

// 認証チェック（エラーを返す版）
export async function checkAuth(): Promise<{ success: true; userId: string } | { success: false; error: string }> {
  try {
    const authResult = await auth();
    if (!authResult?.userId) {
      return { success: false, error: '認証が必要です' };
    }
    return { success: true, userId: authResult.userId };
  } catch (error) {
    logger.error({ error }, '認証チェックに失敗');
    return { success: false, error: '認証チェックに失敗しました' };
  }
}

// 記事の所有権チェック
export async function checkPostOwnership(postId: number, userId: string): Promise<boolean> {
  const { db } = getDatabase();
  const { blogPosts } = await import('@/shared/models/Schema');
  const { eq } = await import('drizzle-orm');
  
  const post = await db.select({ authorId: blogPosts.authorId })
    .from(blogPosts)
    .where(eq(blogPosts.id, postId))
    .limit(1);
  
  return post.length > 0 && post[0]?.authorId === userId;
}

// 記事の所有権チェック（詳細版）
export async function checkPostOwnershipDetailed(postId: number, userId: string) {
  const { db } = getDatabase();
  const { blogPosts } = await import('@/shared/models/Schema');
  const { eq } = await import('drizzle-orm');
  
  const post = await db.select()
    .from(blogPosts)
    .where(eq(blogPosts.id, postId))
    .limit(1);
  
  if (post.length === 0) {
    return { success: false, error: '記事が見つかりません', post: null };
  }
  
  if (post[0]?.authorId !== userId) {
    return { success: false, error: 'この記事を編集する権限がありません', post: null };
  }
  
  return { success: true, post: post[0] };
}
