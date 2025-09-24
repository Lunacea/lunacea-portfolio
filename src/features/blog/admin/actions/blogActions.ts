'use server';

import { auth } from '@/shared/libs/auth-server';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { blogPosts } from '@/shared/models/Schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logger } from '@/shared/libs/Logger';
import { generateOGImageForPost } from '@/shared/libs/ogImageGenerator';
import { convertMDXToHTML } from '@/shared/libs/mdxConverter';
import { savePostVersion } from './versionActions';

// データベース接続
const client = postgres(process.env.DATABASE_URL as string);
const db = drizzle(client);

export interface CreateBlogPostResult {
  success: boolean;
  error?: string;
  postId?: number;
}

/**
 * 新しいブログ記事を作成
 */
export async function createBlogPost(formData: FormData): Promise<CreateBlogPostResult> {
  try {
    // 認証チェック
    const authResult = await auth();
    if (!authResult?.userId) {
      return { success: false, error: '認証が必要です' };
    }
    const userId = authResult.userId;

    // フォームデータの取得とバリデーション
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const tagsString = formData.get('tags') as string;
    const status = formData.get('status') as string;

    if (!title || !content) {
      return { success: false, error: 'タイトルとコンテンツは必須です' };
    }

    // タグの処理
    let tags: string[] = [];
    try {
      tags = JSON.parse(tagsString || '[]');
    } catch {
      // JSONパースに失敗した場合は空配列
      tags = [];
    }

    // スラッグの生成
    const slug = generateSlug(title);

    // 既存のスラッグとの重複チェック
    const existingPost = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (existingPost.length > 0) {
      return { success: false, error: '同じタイトルの記事が既に存在します' };
    }

    // MDXからHTMLへの変換
    let contentHtml: string | null = null;
    try {
      contentHtml = await convertMDXToHTML(content);
    } catch (error) {
      logger.error({ error }, 'MDXからHTMLへの変換に失敗（記事は作成されます）');
      // 変換に失敗しても記事作成は継続
    }

    // 記事の作成
    const newPost = await db.insert(blogPosts).values({
      slug,
      title,
      description: description || null,
      content,
      contentHtml,
      excerpt: generateExcerpt(content),
      tags,
      publishedAt: status === 'published' ? new Date() : null,
      updatedAt: new Date(),
      createdAt: new Date(),
      status: status as 'draft' | 'published',
      isPublished: status === 'published',
      readingTime: calculateReadingTime(content),
      viewCount: 0,
      coverImage: null,
      ogImage: null, // 後でOGP画像生成後に更新
      authorId: userId,
      metaTitle: title,
      metaDescription: description || null,
    }).returning();

    // 公開記事の場合はOGP画像を生成
    if (status === 'published') {
      try {
        const ogImagePath = await generateOGImageForPost(slug, title);
        
        // OGP画像パスを更新
        if (newPost[0]) {
          await db.update(blogPosts)
            .set({ ogImage: ogImagePath })
            .where(eq(blogPosts.id, newPost[0].id));
            
          logger.info({ postId: newPost[0].id, ogImagePath }, 'OGP画像を生成・更新しました');
        }
      } catch (ogError) {
        logger.error({ error: ogError, postId: newPost[0]?.id }, 'OGP画像の生成に失敗しました（記事は作成済み）');
        // OGP画像生成に失敗しても記事作成は継続
      }
    }

    logger.info({ postId: newPost[0]?.id, slug, status }, 'ブログ記事を作成しました');

    // キャッシュの再検証
    revalidatePath('/blog');
    revalidatePath('/blog/editor');

    return { 
      success: true, 
      postId: newPost[0]?.id 
    };

  } catch (error) {
    logger.error({ error }, 'ブログ記事の作成に失敗しました');
    return { 
      success: false, 
      error: '記事の作成中にエラーが発生しました' 
    };
  }
}

/**
 * 既存のブログ記事を更新
 */
export async function updateBlogPost(postId: number, formData: FormData): Promise<CreateBlogPostResult> {
  try {
    // 認証チェック
    const authResult = await auth();
    if (!authResult?.userId) {
      return { success: false, error: '認証が必要です' };
    }
    const userId = authResult.userId;

    // 記事の存在確認と権限チェック
    const existingPost = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (existingPost.length === 0) {
      return { success: false, error: '記事が見つかりません' };
    }

    if (existingPost[0]?.authorId !== userId) {
      return { success: false, error: 'この記事を編集する権限がありません' };
    }

    // フォームデータの取得
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const tagsString = formData.get('tags') as string;
    const status = formData.get('status') as string;

    if (!title || !content) {
      return { success: false, error: 'タイトルとコンテンツは必須です' };
    }

    // タグの処理
    let tags: string[] = [];
    try {
      tags = JSON.parse(tagsString || '[]');
    } catch {
      tags = [];
    }

    // スラッグの更新（タイトルが変更された場合）
    const newSlug = generateSlug(title);
    const slugChanged = existingPost[0]?.slug !== newSlug;

    // スラッグの重複チェック（変更された場合のみ）
    if (slugChanged) {
      const duplicatePost = await db.select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, newSlug))
        .limit(1);

      if (duplicatePost.length > 0) {
        return { success: false, error: '同じタイトルの記事が既に存在します' };
      }
    }

    // MDXからHTMLへの変換
    let contentHtml: string | null = null;
    try {
      contentHtml = await convertMDXToHTML(content);
    } catch (error) {
      logger.error({ error, postId }, 'MDXからHTMLへの変換に失敗（記事は更新されます）');
      // 変換に失敗しても記事更新は継続
    }

    // 記事の更新
    await db.update(blogPosts)
      .set({
        slug: slugChanged ? newSlug : existingPost[0]?.slug,
        title,
        description: description || null,
        content,
        contentHtml,
        excerpt: generateExcerpt(content),
        tags,
        publishedAt: status === 'published' ? (existingPost[0]?.publishedAt || new Date()) : existingPost[0]?.publishedAt,
        updatedAt: new Date(),
        status: status as 'draft' | 'published',
        isPublished: status === 'published',
        readingTime: calculateReadingTime(content),
        metaTitle: title,
        metaDescription: description || null,
      })
      .where(eq(blogPosts.id, postId));

    // 公開記事の場合はOGP画像を生成（タイトルが変更された場合または新規公開の場合）
    if (status === 'published' && (title !== existingPost[0]?.title || !existingPost[0]?.isPublished)) {
      try {
        const finalSlug = slugChanged ? newSlug : existingPost[0]?.slug;
        const ogImagePath = await generateOGImageForPost(finalSlug, title);
        
        // OGP画像パスを更新
        await db.update(blogPosts)
          .set({ ogImage: ogImagePath })
          .where(eq(blogPosts.id, postId));
          
        logger.info({ postId, ogImagePath }, 'OGP画像を生成・更新しました');
      } catch (ogError) {
        logger.error({ error: ogError, postId }, 'OGP画像の生成に失敗しました（記事は更新済み）');
        // OGP画像生成に失敗しても記事更新は継続
      }
    }

    logger.info({ postId, slug: newSlug, status }, 'ブログ記事を更新しました');

    // バージョンを保存（コンテンツが変更された場合のみ）
    if (content !== existingPost[0]?.content) {
      try {
        await savePostVersion(postId, content);
        logger.info({ postId }, '記事のバージョンを保存しました');
      } catch (versionError) {
        logger.error({ error: versionError, postId }, 'バージョン保存に失敗しました（記事は更新済み）');
        // バージョン保存に失敗しても記事更新は継続
      }
    }

    // キャッシュの再検証
    revalidatePath('/blog');
    revalidatePath('/blog/editor');
    if (slugChanged && existingPost[0]?.slug) {
      revalidatePath(`/blog/${existingPost[0].slug}`);
    }
    revalidatePath(`/blog/${newSlug}`);

    return { success: true };

  } catch (error) {
    logger.error({ error, postId }, 'ブログ記事の更新に失敗しました');
    return { 
      success: false, 
      error: '記事の更新中にエラーが発生しました' 
    };
  }
}

/**
 * ブログ記事を削除
 */
export async function deleteBlogPost(postId: number): Promise<CreateBlogPostResult> {
  try {
    // 認証チェック
    const authResult = await auth();
    if (!authResult?.userId) {
      return { success: false, error: '認証が必要です' };
    }
    const userId = authResult.userId;

    // 記事の存在確認と権限チェック
    const existingPost = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (existingPost.length === 0) {
      return { success: false, error: '記事が見つかりません' };
    }

    if (existingPost[0]?.authorId !== userId) {
      return { success: false, error: 'この記事を削除する権限がありません' };
    }

    // 記事の削除
    await db.delete(blogPosts).where(eq(blogPosts.id, postId));

    logger.info({ postId, slug: existingPost[0]?.slug }, 'ブログ記事を削除しました');

    // キャッシュの再検証
    revalidatePath('/blog');
    revalidatePath('/blog/editor');
    if (existingPost[0]?.slug) {
      revalidatePath(`/blog/${existingPost[0].slug}`);
    }

    return { success: true };

  } catch (error) {
    logger.error({ error, postId }, 'ブログ記事の削除に失敗しました');
    return { 
      success: false, 
      error: '記事の削除中にエラーが発生しました' 
    };
  }
}

/**
 * タイトルからスラッグを生成
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 特殊文字を除去
    .replace(/\s+/g, '-') // スペースをハイフンに
    .replace(/-+/g, '-') // 連続するハイフンを1つに
    .replace(/^-+|-+$/g, ''); // 先頭・末尾のハイフンを除去
}

/**
 * コンテンツから抜粋を生成
 */
function generateExcerpt(content: string): string {
  // Markdownの見出し記号を除去
  const cleanContent = content
    .replace(/^#+\s/gm, '') // 見出し記号を除去
    .replace(/[#*_`~[\]]/g, '') // その他のMarkdown記号を除去
    .replace(/!\[.*?\]\(.*?\)/g, '') // 画像を除去
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // リンクテキストのみ残す
    .replace(/\s+/g, ' ') // 連続するスペースを1つに
    .trim();

  // 200文字で切り取り
  return cleanContent.length > 200 
    ? `${cleanContent.substring(0, 200)}...` 
    : cleanContent;
}

/**
 * 読了時間を計算（分単位）
 */
function calculateReadingTime(content: string): number {
  // 日本語は1分間に400文字、英語は200単語として計算
  const japaneseChars = (content.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []).length;
  const englishWords = content.replace(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '').split(/\s+/).length;
  
  const japaneseTime = japaneseChars / 400;
  const englishTime = englishWords / 200;
  
  return Math.max(1, Math.ceil(japaneseTime + englishTime));
}
