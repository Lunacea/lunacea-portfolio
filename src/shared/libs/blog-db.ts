import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { blogPosts } from '@/shared/models/Schema';
import { eq, and, desc } from 'drizzle-orm';
import { logger } from '@/shared/libs/Logger';
import 'server-only';

// データベース接続
const client = postgres(process.env.DATABASE_URL as string);
const db = drizzle(client);

export { db };

export type BlogPostFromDB = {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  content: string;
  contentHtml?: string | null;
  excerpt?: string | null;
  tags: string[] | null;
  publishedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  status: string;
  isPublished: boolean;
  readingTime?: number | null;
  viewCount: number;
  coverImage?: string | null;
  ogImage?: string | null;
  authorId: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export type BlogPostMetaFromDB = Omit<BlogPostFromDB, 'content' | 'contentHtml'>;

/**
 * データベースから公開済みの記事を取得
 */
export async function getBlogPostsFromDB(): Promise<BlogPostMetaFromDB[]> {
  try {
    const posts = await db.select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      description: blogPosts.description,
      excerpt: blogPosts.excerpt,
      tags: blogPosts.tags,
      publishedAt: blogPosts.publishedAt,
      updatedAt: blogPosts.updatedAt,
      createdAt: blogPosts.createdAt,
      status: blogPosts.status,
      isPublished: blogPosts.isPublished,
      readingTime: blogPosts.readingTime,
      viewCount: blogPosts.viewCount,
      coverImage: blogPosts.coverImage,
      ogImage: blogPosts.ogImage,
      authorId: blogPosts.authorId,
      metaTitle: blogPosts.metaTitle,
      metaDescription: blogPosts.metaDescription,
    })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.isPublished, true),
        eq(blogPosts.status, 'published')
      )
    )
    .orderBy(desc(blogPosts.publishedAt));

    return posts.map(post => ({
      ...post,
      tags: post.tags || [],
    }));
  } catch (error) {
    logger.error({ error }, 'データベースから記事一覧の取得に失敗');
    return [];
  }
}

/**
 * データベースから特定の記事を取得
 */
export async function getBlogPostFromDB(slug: string): Promise<BlogPostFromDB | null> {
  try {
    const posts = await db.select()
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.isPublished, true),
          eq(blogPosts.status, 'published')
        )
      )
      .limit(1);

    if (posts.length === 0) {
      return null;
    }

    return posts[0] ? {
      ...posts[0],
      tags: posts[0].tags || [],
    } : null;
  } catch (error) {
    logger.error({ error, slug }, 'データベースから記事の取得に失敗');
    return null;
  }
}

/**
 * データベースからタグで記事を検索
 */
export async function getBlogPostsByTagFromDB(tag: string): Promise<BlogPostMetaFromDB[]> {
  try {
    const posts = await db.select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      description: blogPosts.description,
      excerpt: blogPosts.excerpt,
      tags: blogPosts.tags,
      publishedAt: blogPosts.publishedAt,
      updatedAt: blogPosts.updatedAt,
      createdAt: blogPosts.createdAt,
      status: blogPosts.status,
      isPublished: blogPosts.isPublished,
      readingTime: blogPosts.readingTime,
      viewCount: blogPosts.viewCount,
      coverImage: blogPosts.coverImage,
      ogImage: blogPosts.ogImage,
      authorId: blogPosts.authorId,
      metaTitle: blogPosts.metaTitle,
      metaDescription: blogPosts.metaDescription,
    })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.isPublished, true),
        eq(blogPosts.status, 'published')
      )
    )
    .orderBy(desc(blogPosts.publishedAt));

    // PostgreSQLの配列検索はDrizzleで直接サポートされていないため、JavaScriptでフィルタリング
    return posts.filter(post => post.tags?.includes(tag)).map(post => ({
      ...post,
      tags: post.tags || [],
    }));
  } catch (error) {
    logger.error({ error, tag }, 'データベースからタグ記事の取得に失敗');
    return [];
  }
}

/**
 * データベースからすべてのタグを取得
 */
export async function getAllTagsFromDB(): Promise<string[]> {
  try {
    const posts = await db.select({ tags: blogPosts.tags })
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.isPublished, true),
          eq(blogPosts.status, 'published')
        )
      );

    const allTags = posts.flatMap(post => post.tags || []);
    return Array.from(new Set(allTags)).sort();
  } catch (error) {
    logger.error({ error }, 'データベースからタグ一覧の取得に失敗');
    return [];
  }
}

/**
 * データベースから関連記事を取得
 */
export async function getRelatedPostsFromDB(slug: string, limit = 3): Promise<BlogPostMetaFromDB[]> {
  try {
    // まず対象記事を取得
    const targetPost = await getBlogPostFromDB(slug);
    if (!targetPost) {
      return [];
    }

    // 同じタグを持つ記事を取得
    const posts = await db.select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      description: blogPosts.description,
      excerpt: blogPosts.excerpt,
      tags: blogPosts.tags,
      publishedAt: blogPosts.publishedAt,
      updatedAt: blogPosts.updatedAt,
      createdAt: blogPosts.createdAt,
      status: blogPosts.status,
      isPublished: blogPosts.isPublished,
      readingTime: blogPosts.readingTime,
      viewCount: blogPosts.viewCount,
      coverImage: blogPosts.coverImage,
      ogImage: blogPosts.ogImage,
      authorId: blogPosts.authorId,
      metaTitle: blogPosts.metaTitle,
      metaDescription: blogPosts.metaDescription,
    })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.isPublished, true),
        eq(blogPosts.status, 'published')
      )
    )
    .orderBy(desc(blogPosts.publishedAt));

    // タグの共通数でスコアリング
    const scored = posts
      .filter(p => p.slug !== slug)
      .map(p => {
         const common = (p.tags || []).filter(tag => (targetPost.tags || []).includes(tag)).length;
        return { post: p, score: common };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || new Date(b.post.publishedAt as Date).getTime() - new Date(a.post.publishedAt as Date).getTime())
      .slice(0, limit)
      .map(x => x.post);

    return scored.map(item => ({
      ...item,
      tags: item.tags || [],
    }));
  } catch (error) {
    logger.error({ error, slug }, 'データベースから関連記事の取得に失敗');
    return [];
  }
}

/**
 * 記事の閲覧数を増加
 */
export async function incrementViewCount(slug: string): Promise<void> {
  try {
    // 現在の閲覧数を取得してから更新
    const currentPost = await db.select({ viewCount: blogPosts.viewCount })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);
    
    if (currentPost.length > 0) {
      await db.update(blogPosts)
        .set({ viewCount: (currentPost[0]?.viewCount || 0) + 1 })
        .where(eq(blogPosts.slug, slug));
    }
  } catch (error) {
    logger.error({ error, slug }, '閲覧数の更新に失敗');
  }
}
