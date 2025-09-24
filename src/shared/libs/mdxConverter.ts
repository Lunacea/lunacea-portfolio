import { parseMarkdownToHtml } from './mdx-parser';
import { logger } from '@/shared/libs/Logger';
import 'server-only';

/**
 * MDXコンテンツをHTMLに変換
 * @param mdxContent MDXコンテンツ
 * @returns HTML文字列
 */
export async function convertMDXToHTML(mdxContent: string): Promise<string> {
  try {
    // 既存のparseMarkdownToHtml関数を使用
    const html = await parseMarkdownToHtml(mdxContent);
    return html;
  } catch (error) {
    logger.error({ error }, 'MDXからHTMLへの変換に失敗');
    // フォールバック: 基本的なHTMLエスケープ
    return `<pre class="error-fallback">${escapeHtml(mdxContent)}</pre>`;
  }
}

/**
 * HTMLエスケープ関数
 * @param text エスケープするテキスト
 * @returns エスケープされたHTML
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m as keyof typeof map] || m);
}

/**
 * 記事のコンテンツをHTMLに変換してデータベースに保存
 * @param postId 記事ID
 * @param mdxContent MDXコンテンツ
 * @returns 変換されたHTML
 */
export async function convertAndSavePostHTML(postId: number, mdxContent: string): Promise<string> {
  try {
    const html = await convertMDXToHTML(mdxContent);
    
    // データベースにHTMLを保存
    const { db } = await import('@/shared/libs/blog-db');
    const { blogPosts } = await import('@/shared/models/Schema');
    const { eq } = await import('drizzle-orm');
    
      await db.update(blogPosts)
      .set({ contentHtml: html })
      .where(eq(blogPosts.id, postId));
    
    logger.info({ postId }, '記事のHTML変換と保存が完了しました');
    return html;
  } catch (error) {
    logger.error({ error, postId }, '記事のHTML変換と保存に失敗しました');
    throw error;
  }
}

/**
 * バッチで記事のHTML変換を実行
 * @param postIds 変換する記事IDの配列
 * @returns 変換結果の配列
 */
export async function batchConvertPostsToHTML(postIds: number[]): Promise<Array<{ postId: number; success: boolean; error?: string }>> {
  const results: Array<{ postId: number; success: boolean; error?: string }> = [];
  
  for (const postId of postIds) {
    try {
      const { db } = await import('@/shared/libs/blog-db');
      const { blogPosts } = await import('@/shared/models/Schema');
      const { eq } = await import('drizzle-orm');
      
      // 記事の取得
          const post = await db.select()
        .from(blogPosts)
        .where(eq(blogPosts.id, postId))
        .limit(1);
      
      if (post.length === 0) {
        results.push({ postId, success: false, error: '記事が見つかりません' });
        continue;
      }
      
      // HTML変換と保存
      await convertAndSavePostHTML(postId, post[0]?.content || '');
      results.push({ postId, success: true });
      
    } catch (error) {
      logger.error({ error, postId }, '記事のHTML変換に失敗');
      results.push({ 
        postId, 
        success: false, 
        error: error instanceof Error ? error.message : '不明なエラー' 
      });
    }
  }
  
  return results;
}
