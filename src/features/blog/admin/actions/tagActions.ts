'use server';

import { blogPosts } from '@/shared/models/Schema';
import { and, eq, sql } from 'drizzle-orm';
import { logger } from '@/shared/libs/Logger';
import { getDatabase, checkAuth } from '@/shared/libs/db-common';
import 'server-only';

const { db } = getDatabase();

export type TagOperationResult = { success: true; affected: number } | { success: false; error: string };

export async function renameTag(oldTag: string, newTag: string): Promise<TagOperationResult> {
  try {
    const authResult = await checkAuth();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const userId = authResult.userId;
    
    if (!oldTag?.trim() || !newTag?.trim()) {
      return { success: false, error: 'タグ名が不正です' };
    }

    const res = await db
      .update(blogPosts)
      .set({
        // tags = array_replace(tags, oldTag, newTag)
        tags: sql`array_replace(${blogPosts.tags}, ${oldTag}, ${newTag})`,
      })
      .where(and(eq(blogPosts.authorId, userId)));

    const affected = (res as unknown as { rowCount?: number })?.rowCount ?? 0;
    logger.info({ oldTag, newTag, affected }, 'タグをリネームしました');
    return { success: true, affected };
  } catch (error) {
    logger.error({ error, oldTag, newTag }, 'タグのリネームに失敗しました');
    return { success: false, error: 'タグの更新に失敗しました' };
  }
}

export async function mergeTags(fromTagA: string, fromTagB: string, toTag: string): Promise<TagOperationResult> {
  try {
    const authResult = await checkAuth();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const userId = authResult.userId;
    
    if (!fromTagA?.trim() || !fromTagB?.trim() || !toTag?.trim()) {
      return { success: false, error: 'タグ名が不正です' };
    }

    // tags = (select array_agg(distinct t) from unnest(array_replace(array_replace(tags, a, to), b, to)) t)
    const res = await db
      .update(blogPosts)
      .set({
        tags: sql`(
          SELECT array_agg(DISTINCT t)
          FROM unnest(array_replace(array_replace(${blogPosts.tags}, ${fromTagA}, ${toTag}), ${fromTagB}, ${toTag})) AS t
        )`,
      })
      .where(and(eq(blogPosts.authorId, userId)));

    const affected = (res as unknown as { rowCount?: number })?.rowCount ?? 0;
    logger.info({ fromTagA, fromTagB, toTag, affected }, 'タグを統合しました');
    return { success: true, affected };
  } catch (error) {
    logger.error({ error, fromTagA, fromTagB, toTag }, 'タグの統合に失敗しました');
    return { success: false, error: 'タグの統合に失敗しました' };
  }
}

export async function deleteTag(tag: string): Promise<TagOperationResult> {
  try {
    const authResult = await checkAuth();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const userId = authResult.userId;
    
    if (!tag?.trim()) {
      return { success: false, error: 'タグ名が不正です' };
    }

    const res = await db
      .update(blogPosts)
      .set({ tags: sql`array_remove(${blogPosts.tags}, ${tag})` })
      .where(and(eq(blogPosts.authorId, userId)));

    const affected = (res as unknown as { rowCount?: number })?.rowCount ?? 0;
    logger.info({ tag, affected }, 'タグを削除しました');
    return { success: true, affected };
  } catch (error) {
    logger.error({ error, tag }, 'タグの削除に失敗しました');
    return { success: false, error: 'タグの削除に失敗しました' };
  }
}




