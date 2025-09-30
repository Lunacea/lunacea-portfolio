'use server';

import { blogPosts } from '@/shared/models/Schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logger } from '@/shared/libs/Logger';
import { generateOGImageForPost } from '@/shared/libs/ogImageGenerator';
import { convertMDXToHTML } from '@/shared/libs/mdxConverter';
import { savePostVersion } from './versionActions';
import { getDatabase, checkAuth, checkPostOwnershipDetailed } from '@/shared/libs/db-common';
import { generateSlug, generateExcerpt, calculateReadingTime, normalizeTags } from '@/shared/libs/blog-utils';

// データベース接続
const { db } = getDatabase();

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
    const authResult = await checkAuth();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const userId = authResult.userId;

    // フォームデータの取得とバリデーション
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const tagsString = formData.get('tags') as string;
    const status = formData.get('status') as string;

    if (!title || !content) {
      return { success: false, error: 'タイトルとコンテンツは必須です' };
    }

    // タグの処理
    const tags = normalizeTags(tagsString);

    // スラッグの処理（フォームから取得、空の場合はタイトルから生成）
    const finalSlug = slug && slug.trim() ? slug.trim() : generateSlug(title);

    // 既存のスラッグとの重複チェック
    const existingPost = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, finalSlug))
      .limit(1);

    if (existingPost.length > 0) {
      return { success: false, error: '同じスラッグの記事が既に存在します' };
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
      slug: finalSlug,
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
        const ogImagePath = await generateOGImageForPost(finalSlug, title);
        
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

    logger.info({ postId: newPost[0]?.id, slug: finalSlug, status }, 'ブログ記事を作成しました');

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
    const authResult = await checkAuth();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const userId = authResult.userId;

    // 記事の存在確認と権限チェック
    const ownershipResult = await checkPostOwnershipDetailed(postId, userId);
    if (!ownershipResult.success) {
      return { success: false, error: ownershipResult.error };
    }
    const existingPost = ownershipResult.post;
    
    // TypeScriptの型ガード
    if (!existingPost) {
      return { success: false, error: '記事データの取得に失敗しました' };
    }

    // フォームデータの取得
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const tagsString = formData.get('tags') as string;
    const status = formData.get('status') as string;

    if (!title || !content) {
      return { success: false, error: 'タイトルとコンテンツは必須です' };
    }

    // タグの処理
    const tags = normalizeTags(tagsString);

    // スラッグの処理（フォームから取得、空の場合はタイトルから生成）
    const newSlug = slug && slug.trim() ? slug.trim() : generateSlug(title);
    const slugChanged = existingPost.slug !== newSlug;

    // スラッグの重複チェック（変更された場合のみ）
    if (slugChanged) {
      const duplicatePost = await db.select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, newSlug))
        .limit(1);

      if (duplicatePost.length > 0) {
        return { success: false, error: '同じスラッグの記事が既に存在します' };
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
        slug: slugChanged ? newSlug : existingPost.slug,
        title,
        description: description || null,
        content,
        contentHtml,
        excerpt: generateExcerpt(content),
        tags,
        publishedAt: status === 'published' ? (existingPost.publishedAt || new Date()) : existingPost.publishedAt,
        updatedAt: new Date(),
        status: status as 'draft' | 'published',
        isPublished: status === 'published',
        readingTime: calculateReadingTime(content),
        metaTitle: title,
        metaDescription: description || null,
      })
      .where(eq(blogPosts.id, postId));

    // 公開記事の場合はOGP画像を生成（タイトルが変更された場合または新規公開の場合）
    if (status === 'published' && (title !== existingPost.title || !existingPost.isPublished)) {
      try {
        const finalSlug = slugChanged ? newSlug : existingPost.slug;
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
    if (content !== existingPost.content) {
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
    if (slugChanged && existingPost.slug) {
      revalidatePath(`/blog/${existingPost.slug}`);
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
 * 記事の公開ステータスだけを更新
 */
export async function updatePostStatus(postId: number, nextStatus: 'draft' | 'published'): Promise<CreateBlogPostResult> {
  try {
    const authResult = await checkAuth();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const userId = authResult.userId;

    const ownershipResult = await checkPostOwnershipDetailed(postId, userId);
    if (!ownershipResult.success) {
      return { success: false, error: ownershipResult.error };
    }
    const existingPost = ownershipResult.post;
    
    // TypeScriptの型ガード
    if (!existingPost) {
      return { success: false, error: '記事データの取得に失敗しました' };
    }

    await db.update(blogPosts)
      .set({
        status: nextStatus,
        isPublished: nextStatus === 'published',
        publishedAt: nextStatus === 'published' ? (existingPost.publishedAt || new Date()) : existingPost.publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, postId));

    // キャッシュの再検証
    revalidatePath('/blog');
    revalidatePath('/dashboard/blog');
    if (existingPost.slug) {
      revalidatePath(`/blog/${existingPost.slug}`);
    }

    return { success: true };
  } catch (error) {
    logger.error({ error, postId, nextStatus }, '記事ステータス更新に失敗');
    return { success: false, error: '記事の更新中にエラーが発生しました' };
  }
}

/**
 * ブログ記事を削除
 */
export async function deleteBlogPost(postId: number): Promise<CreateBlogPostResult> {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const userId = authResult.userId;

    // 記事の存在確認と権限チェック
    const ownershipResult = await checkPostOwnershipDetailed(postId, userId);
    if (!ownershipResult.success) {
      return { success: false, error: ownershipResult.error };
    }
    const existingPost = ownershipResult.post;
    
    // TypeScriptの型ガード
    if (!existingPost) {
      return { success: false, error: '記事データの取得に失敗しました' };
    }

    // 記事の削除
    await db.delete(blogPosts).where(eq(blogPosts.id, postId));

    logger.info({ postId, slug: existingPost.slug }, 'ブログ記事を削除しました');

    // キャッシュの再検証
    revalidatePath('/blog');
    revalidatePath('/blog/editor');
    if (existingPost.slug) {
      revalidatePath(`/blog/${existingPost.slug}`);
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

