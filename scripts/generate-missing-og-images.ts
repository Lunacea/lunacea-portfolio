#!/usr/bin/env bun
/**
 * 不足しているOGP画像を一括生成するスクリプト
 * 
 * 使用方法:
 * bun run scripts/generate-missing-og-images.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { blogPosts } from '@/shared/models/Schema';
import { and, eq, isNull, or } from 'drizzle-orm';
import { generateOGImagesForPosts, checkOGImageExists } from '@/shared/libs/ogImageGenerator';
import { logger } from '@/shared/libs/Logger';

// 環境変数の確認
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  logger.error('DATABASE_URL環境変数が設定されていません');
  process.exit(1);
}

// データベース接続
const client = postgres(DATABASE_URL);
const db = drizzle(client);

/**
 * 不足しているOGP画像を一括生成
 */
async function generateMissingOGImages(): Promise<void> {
  try {
    logger.info('🚀 不足しているOGP画像の一括生成を開始します...');
    
    // OGP画像が存在しない公開済み記事を取得
    const postsWithoutOG = await db.select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      ogImage: blogPosts.ogImage,
    })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.isPublished, true),
        eq(blogPosts.status, 'published'),
        or(
          isNull(blogPosts.ogImage),
          eq(blogPosts.ogImage, '')
        )
      )
    );

    logger.info(`📁 ${postsWithoutOG.length}個の記事でOGP画像が不足しています`);

    if (postsWithoutOG.length === 0) {
      logger.info('✅ 不足しているOGP画像はありません');
      return;
    }

    // ファイルシステムでもOGP画像が存在しない記事をフィルタリング
    const postsToGenerate = postsWithoutOG.filter(post => 
      !checkOGImageExists(post.slug)
    );

    logger.info(`🔄 ${postsToGenerate.length}個の記事のOGP画像を生成します`);

    if (postsToGenerate.length === 0) {
      logger.info('✅ ファイルシステム上にOGP画像が存在するため、生成をスキップします');
      return;
    }

    // OGP画像を一括生成
    const results = await generateOGImagesForPosts(
      postsToGenerate.map(post => ({
        slug: post.slug,
        title: post.title,
      }))
    );

    // 成功した記事のOGP画像パスをデータベースに更新
    const successfulPosts = results.filter(r => r.success);
    logger.info(`✅ ${successfulPosts.length}個のOGP画像を生成しました`);

    for (const result of successfulPosts) {
      const post = postsToGenerate.find(p => p.slug === result.slug);
      if (post) {
        const ogImagePath = `/og-images/${post.slug}.png`;
        
        await db.update(blogPosts)
          .set({ ogImage: ogImagePath })
          .where(eq(blogPosts.id, post.id));
          
        logger.info(`📝 データベースを更新: ${post.slug} -> ${ogImagePath}`);
      }
    }

    // 失敗した記事の報告
    const failedPosts = results.filter(r => !r.success);
    if (failedPosts.length > 0) {
      logger.warn(`❌ ${failedPosts.length}個のOGP画像の生成に失敗しました:`);
      failedPosts.forEach(result => {
        logger.warn(`  - ${result.slug}: ${result.error}`);
      });
    }

  } catch (error) {
    logger.error({ error }, 'OGP画像の一括生成中にエラーが発生しました');
    throw error;
  } finally {
    // データベース接続を閉じる
    await client.end();
  }
}

/**
 * メイン実行関数
 */
async function main(): Promise<void> {
  try {
    logger.info('不足しているOGP画像の一括生成を開始します...');
    
    await generateMissingOGImages();
    
    logger.info('OGP画像の一括生成が完了しました！');
    
  } catch (error) {
    logger.error({ error }, 'OGP画像一括生成スクリプトの実行に失敗しました');
    logger.error({ error }, 'OGP画像の一括生成に失敗しました');
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
