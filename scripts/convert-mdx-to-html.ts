#!/usr/bin/env bun

import { db } from '@/shared/libs/blog-db';
import { blogPosts } from '@/shared/models/Schema';
import { isNull, eq, or } from 'drizzle-orm';
import { batchConvertPostsToHTML } from '@/shared/libs/mdxConverter';
import { logger } from '@/shared/libs/Logger';

/**
 * MDXからHTMLへの変換が不足している記事を一括変換
 */
async function convertMissingMDXToHTML() {
  try {
    logger.info('MDXからHTMLへの変換を開始します');

    // contentHtmlがnullまたは空の記事を取得
        const postsToConvert = await db.select({ id: blogPosts.id })
      .from(blogPosts)
      .where(
        or(
          isNull(blogPosts.contentHtml),
          eq(blogPosts.contentHtml, '')
        )
      );

    if (postsToConvert.length === 0) {
      logger.info('変換が必要な記事はありません');
      return;
    }

    logger.info({ count: postsToConvert.length }, '変換対象の記事数を確認しました');

    // バッチ変換を実行
    const postIds = postsToConvert.map((post: { id: number }) => post.id);
    const results = await batchConvertPostsToHTML(postIds);

    // 結果の集計
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    logger.info({ 
      total: results.length, 
      success: successCount, 
      failure: failureCount 
    }, 'MDXからHTMLへの変換が完了しました');

    // 失敗した記事の詳細をログ出力
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      logger.warn({ failures }, '変換に失敗した記事があります');
    }

  } catch (error) {
    logger.error({ error }, 'MDXからHTMLへの変換中にエラーが発生しました');
    process.exit(1);
  }
}

// スクリプト実行
if (import.meta.main) {
  convertMissingMDXToHTML()
    .then(() => {
      logger.info('スクリプトが正常に完了しました');
      process.exit(0);
    })
    .catch((error) => {
      logger.error({ error }, 'スクリプトの実行中にエラーが発生しました');
      process.exit(1);
    });
}
