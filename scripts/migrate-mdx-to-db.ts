#!/usr/bin/env bun
/**
 * 既存のMDXファイルをデータベースに移行するスクリプト
 * 
 * 使用方法:
 * bun run scripts/migrate-mdx-to-db.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { blogPosts } from '@/shared/models/Schema';
import { getBlogPostFiles, parseBlogPost } from '@/shared/libs/blog.impl';
import { logger } from '@/shared/libs/Logger';
import { eq } from 'drizzle-orm';

// 環境変数の確認
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  logger.error('DATABASE_URL環境変数が設定されていません');
  process.exit(1);
}

// データベース接続
const client = postgres(DATABASE_URL);
const db = drizzle(client);

interface MigrationResult {
  success: number;
  failed: number;
  errors: Array<{ filename: string; error: string }>;
}

/**
 * 既存記事をデータベースに移行
 */
async function migrateExistingPosts(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: 0,
    failed: 0,
    errors: []
  };

  try {
    logger.info('🚀 既存記事の移行を開始します...');
    
    // 既存のブログファイルを取得
    const files = getBlogPostFiles();
    logger.info(`📁 ${files.length}個の記事ファイルが見つかりました`);

    if (files.length === 0) {
      logger.warn('⚠️ 移行対象の記事ファイルが見つかりません');
      return result;
    }

    // 各ファイルを処理
    for (const filename of files) {
      try {
        logger.info(`📝 処理中: ${filename}`);
        
        // 記事を解析
        const post = await parseBlogPost(filename);
        
        // 既に同じスラッグの記事が存在するかチェック
        const existingPost = await db.select()
          .from(blogPosts)
          .where(eq(blogPosts.slug, post.slug))
          .limit(1);

        if (existingPost.length > 0) {
          logger.warn(`⚠️ スラッグ "${post.slug}" の記事は既に存在します。スキップします。`);
          continue;
        }

        // データベースに挿入
        await db.insert(blogPosts).values({
          slug: post.slug,
          title: post.title,
          description: post.description || null,
          content: post.content,
          contentHtml: post.htmlContent || null,
          excerpt: post.excerpt || null,
          tags: post.tags,
          publishedAt: new Date(post.publishedAt),
          updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
          createdAt: new Date(post.publishedAt), // 既存記事の場合はpublishedAtをcreatedAtとして使用
          status: 'published', // 既存記事は公開済みとして扱う
          isPublished: true,
          readingTime: parseInt(post.readingTime?.split(' ')[0] || '1') || 1, // "2 min read" -> 2
          viewCount: 0,
          coverImage: typeof post.coverImage === 'string' ? post.coverImage : null,
          ogImage: typeof post.ogImage === 'string' ? post.ogImage : null,
          authorId: 'system-migration', // 移行時のデフォルト作成者ID
          metaTitle: post.title,
          metaDescription: post.description || null,
        });

        logger.info(`✅ 移行完了: ${post.slug}`);
        result.success++;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ error, filename }, `❌ 移行失敗: ${filename}`);
        result.errors.push({ filename, error: errorMessage });
        result.failed++;
      }
    }

  } catch (error) {
    logger.error({ error }, '移行処理中にエラーが発生しました');
    throw error;
  } finally {
    // データベース接続を閉じる
    await client.end();
  }

  return result;
}

/**
 * 移行結果のサマリーを表示
 */
function displayMigrationSummary(result: MigrationResult): void {
  logger.info('移行結果サマリー');
  logger.info('='.repeat(50));
  logger.info(`成功: ${result.success}件`);
  logger.info(`失敗: ${result.failed}件`);
  
  if (result.errors.length > 0) {
    logger.warn('エラー詳細:');
    result.errors.forEach(({ filename, error }) => {
      logger.warn(`  - ${filename}: ${error}`);
    });
  }
  
  logger.info('移行処理が完了しました！');
}

/**
 * メイン実行関数
 */
async function main(): Promise<void> {
  try {
    logger.info('ブログ記事の移行を開始します...');
    
    const result = await migrateExistingPosts();
    displayMigrationSummary(result);
    
    if (result.failed > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    logger.error({ error }, '移行スクリプトの実行に失敗しました');
    logger.error({ error }, '移行に失敗しました');
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみmain関数を実行
if (import.meta.main) {
  main().catch((error) => {
    logger.error('予期しないエラー:', error);
    process.exit(1);
  });
}
