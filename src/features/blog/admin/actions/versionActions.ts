'use server';

import { auth } from '@/shared/libs/auth-server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { blogPosts, blogPostVersions } from '@/shared/models/Schema';
import { eq, desc, and } from 'drizzle-orm';
import { logger } from '@/shared/libs/Logger';
import 'server-only';

// データベース接続
const client = postgres(process.env.DATABASE_URL as string);
const db = drizzle(client);

export interface VersionResult {
  success: boolean;
  error?: string;
  version?: number;
}

export interface BlogPostVersion {
  id: number;
  postId: number;
  version: number;
  content: string;
  createdAt: Date;
  createdBy: string;
}

/**
 * 記事のバージョンを保存
 */
export async function savePostVersion(postId: number, content: string): Promise<VersionResult> {
  try {
    // 認証チェック
    const authResult = await auth();
    if (!authResult?.userId) {
      return { success: false, error: '認証が必要です' };
    }
    const userId = authResult.userId;

    // 記事の存在確認と権限チェック
    const post = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (post.length === 0) {
      return { success: false, error: '記事が見つかりません' };
    }

    if (post[0]?.authorId !== userId) {
      return { success: false, error: 'この記事を編集する権限がありません' };
    }

    // 最新バージョン番号を取得
    const latestVersion = await db.select({ version: blogPostVersions.version })
      .from(blogPostVersions)
      .where(eq(blogPostVersions.postId, postId))
      .orderBy(desc(blogPostVersions.version))
      .limit(1);

    const nextVersion = latestVersion.length > 0 ? (latestVersion[0]?.version || 0) + 1 : 1;

    // バージョンを保存
    await db.insert(blogPostVersions).values({
      postId,
      version: nextVersion,
      content,
      createdBy: userId,
    }).returning();

    logger.info({ postId, version: nextVersion }, '記事のバージョンを保存しました');

    return { success: true, version: nextVersion };

  } catch (error) {
    logger.error({ error, postId }, '記事のバージョン保存に失敗しました');
    return { 
      success: false, 
      error: 'バージョンの保存中にエラーが発生しました' 
    };
  }
}

/**
 * 記事のバージョン一覧を取得
 */
export async function getPostVersions(postId: number): Promise<BlogPostVersion[]> {
  try {
    // 認証チェック
    const authResult = await auth();
    if (!authResult?.userId) {
      throw new Error('認証が必要です');
    }
    const userId = authResult.userId;

    // 記事の存在確認と権限チェック
    const post = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (post.length === 0) {
      throw new Error('記事が見つかりません');
    }

    if (post[0]?.authorId !== userId) {
      throw new Error('この記事を編集する権限がありません');
    }

    // バージョン一覧を取得
    const versions = await db.select()
      .from(blogPostVersions)
      .where(eq(blogPostVersions.postId, postId))
      .orderBy(desc(blogPostVersions.version));

    return versions;

  } catch (error) {
    logger.error({ error, postId }, '記事のバージョン一覧取得に失敗しました');
    throw error;
  }
}

/**
 * 特定のバージョンを取得
 */
export async function getPostVersion(postId: number, version: number): Promise<BlogPostVersion | null> {
  try {
    // 認証チェック
    const authResult = await auth();
    if (!authResult?.userId) {
      throw new Error('認証が必要です');
    }
    const userId = authResult.userId;

    // 記事の存在確認と権限チェック
    const post = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (post.length === 0) {
      throw new Error('記事が見つかりません');
    }

    if (post[0]?.authorId !== userId) {
      throw new Error('この記事を編集する権限がありません');
    }

    // 特定のバージョンを取得
    const versionData = await db.select()
      .from(blogPostVersions)
      .where(
        and(
          eq(blogPostVersions.postId, postId),
          eq(blogPostVersions.version, version)
        )
      )
      .limit(1);

    return versionData.length > 0 ? versionData[0] || null : null;

  } catch (error) {
    logger.error({ error, postId, version }, '記事のバージョン取得に失敗しました');
    throw error;
  }
}

/**
 * 記事を特定のバージョンに復元
 */
export async function restorePostToVersion(postId: number, version: number): Promise<VersionResult> {
  try {
    // 認証チェック
    const authResult = await auth();
    if (!authResult?.userId) {
      return { success: false, error: '認証が必要です' };
    }
    const userId = authResult.userId;

    // 記事の存在確認と権限チェック
    const post = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (post.length === 0) {
      return { success: false, error: '記事が見つかりません' };
    }

    if (post[0]?.authorId !== userId) {
      return { success: false, error: 'この記事を編集する権限がありません' };
    }

    // 復元するバージョンを取得
    const versionData = await db.select()
      .from(blogPostVersions)
      .where(
        and(
          eq(blogPostVersions.postId, postId),
          eq(blogPostVersions.version, version)
        )
      )
      .limit(1);

    if (versionData.length === 0) {
      return { success: false, error: '指定されたバージョンが見つかりません' };
    }

    // 記事のコンテンツを復元
    const versionRecord = versionData[0];
    if (!versionRecord) {
      return { success: false, error: 'バージョンデータの取得に失敗しました' };
    }
    
    await db.update(blogPosts)
      .set({
        content: versionRecord.content,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, postId));

    logger.info({ postId, version }, '記事をバージョンに復元しました');

    return { success: true };

  } catch (error) {
    logger.error({ error, postId, version }, '記事のバージョン復元に失敗しました');
    return { 
      success: false, 
      error: 'バージョンの復元中にエラーが発生しました' 
    };
  }
}
