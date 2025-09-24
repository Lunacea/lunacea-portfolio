import { getAllBlogPosts, getBlogPost, getRelatedPosts, getAllTags, getBlogPostsByTag } from './blog.impl';
import { 
  getBlogPostsFromDB, 
  getBlogPostFromDB, 
  getRelatedPostsFromDB, 
  getAllTagsFromDB, 
  getBlogPostsByTagFromDB,
  type BlogPostMetaFromDB,
  type BlogPostFromDB
} from './blog-db';
import { logger } from '@/shared/libs/Logger';
import 'server-only';

export type BlogPostMeta = {
  slug: string;
  title: string;
  description?: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  readingTime: string;
  excerpt?: string;
  isMDX?: boolean;
  ogImage?: string | { url: string; width?: number; height?: number; alt?: string };
  coverImage?: string;
  source: 'file' | 'database'; // データソースを識別
};

export type BlogPost = BlogPostMeta & {
  content: string;
  htmlContent?: string;
  tableOfContents?: Array<{ id: string; title: string; level: number }>;
};

/**
 * データベースの記事を既存の形式に変換
 */
function convertDBPostToBlogPost(dbPost: BlogPostMetaFromDB): BlogPostMeta {
  return {
    slug: dbPost.slug,
    title: dbPost.title,
    description: dbPost.description || undefined,
    publishedAt: dbPost.publishedAt?.toISOString() || dbPost.createdAt.toISOString(),
    updatedAt: dbPost.updatedAt.toISOString(),
    tags: dbPost.tags || [],
    readingTime: `${dbPost.readingTime || 1} min read`,
    excerpt: dbPost.excerpt || undefined,
    isMDX: true, // データベースの記事はMDXとして扱う
    ogImage: dbPost.ogImage || undefined,
    coverImage: dbPost.coverImage || undefined,
    source: 'database',
  };
}

/**
 * データベースの記事（フル）を既存の形式に変換
 */
async function convertDBPostToFullBlogPost(dbPost: BlogPostFromDB): Promise<BlogPost> {
  let htmlContent = dbPost.contentHtml;
  
  // htmlContentが存在しない場合のみ動的に生成
  // SSGで生成されたHTMLは既に正しく処理されているため、再生成は避ける
  if (!htmlContent && dbPost.content) {
    try {
      const { parseMDXToHtml } = await import('./mdx-remote');
      htmlContent = await parseMDXToHtml(dbPost.content);
    } catch (error) {
      logger.warn({ error, slug: dbPost.slug }, 'HTMLコンテンツの動的生成に失敗');
      htmlContent = undefined;
    }
  }
  
  return {
    ...convertDBPostToBlogPost(dbPost),
    content: dbPost.content,
    htmlContent: htmlContent || undefined,
    tableOfContents: [], // TODO: データベースに保存するか、動的に生成するか検討
  };
}

/**
 * ハイブリッド方式で記事一覧を取得
 * 1. データベースから公開済み記事を取得
 * 2. ファイルシステムから既存記事を取得
 * 3. 重複を除去してマージ
 */
export async function getAllBlogPostsHybrid(): Promise<BlogPostMeta[]> {
  try {
    // データベースから記事を取得
    const dbPosts = await getBlogPostsFromDB();
    const convertedDBPosts = dbPosts.map(convertDBPostToBlogPost);

    // ファイルシステムから記事を取得
    const filePosts = await getAllBlogPosts();
    const convertedFilePosts = filePosts.map(post => ({
      ...post,
      source: 'file' as const,
    }));

    // 重複を除去（データベースの記事を優先）
    const dbSlugs = new Set(convertedDBPosts.map(post => post.slug));
    const uniqueFilePosts = convertedFilePosts.filter(post => !dbSlugs.has(post.slug));

    // マージして日付順でソート
    const allPosts = [...convertedDBPosts, ...uniqueFilePosts];
    return allPosts.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  } catch (error) {
    logger.error({ error }, 'ハイブリッド記事一覧の取得に失敗');
    // フォールバック: ファイルシステムのみ
    const filePosts = await getAllBlogPosts();
    return filePosts.map(post => ({
      ...post,
      source: 'file' as const,
    }));
  }
}

/**
 * ハイブリッド方式で特定の記事を取得
 * 1. データベースから検索
 * 2. 見つからない場合はファイルシステムから検索
 */
export async function getBlogPostHybrid(slug: string): Promise<BlogPost | null> {
  try {
    // まずデータベースから検索
    const dbPost = await getBlogPostFromDB(slug);
    if (dbPost) {
      return await convertDBPostToFullBlogPost(dbPost);
    }

    // データベースに見つからない場合はファイルシステムから検索
    const filePost = await getBlogPost(slug);
    if (filePost) {
      return {
        ...filePost,
        source: 'file' as const,
      };
    }

    return null;
  } catch (error) {
    logger.error({ error, slug }, 'ハイブリッド記事の取得に失敗');
    // フォールバック: ファイルシステムのみ
    const filePost = await getBlogPost(slug);
    if (filePost) {
      return {
        ...filePost,
        source: 'file' as const,
      };
    }
    return null;
  }
}

/**
 * ハイブリッド方式でタグで記事を検索
 */
export async function getBlogPostsByTagHybrid(tag: string): Promise<BlogPostMeta[]> {
  try {
    // データベースから検索
    const dbPosts = await getBlogPostsByTagFromDB(tag);
    const convertedDBPosts = dbPosts.map(convertDBPostToBlogPost);

    // ファイルシステムから検索
    const filePosts = await getBlogPostsByTag(tag);
    const convertedFilePosts = filePosts.map(post => ({
      ...post,
      source: 'file' as const,
    }));

    // 重複を除去（データベースの記事を優先）
    const dbSlugs = new Set(convertedDBPosts.map(post => post.slug));
    const uniqueFilePosts = convertedFilePosts.filter(post => !dbSlugs.has(post.slug));

    // マージして日付順でソート
    const allPosts = [...convertedDBPosts, ...uniqueFilePosts];
    return allPosts.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  } catch (error) {
    logger.error({ error, tag }, 'ハイブリッドタグ記事の取得に失敗');
    // フォールバック: ファイルシステムのみ
    const filePosts = await getBlogPostsByTag(tag);
    return filePosts.map(post => ({
      ...post,
      source: 'file' as const,
    }));
  }
}

/**
 * ハイブリッド方式でタグ一覧を取得
 */
export async function getAllTagsHybrid(): Promise<string[]> {
  try {
    // データベースからタグを取得
    const dbTags = await getAllTagsFromDB();

    // ファイルシステムからタグを取得
    const fileTags = await getAllTags();

    // マージして重複を除去
    const allTags = [...new Set([...dbTags, ...fileTags])];
    return allTags.sort();

  } catch (error) {
    logger.error({ error }, 'ハイブリッドタグ一覧の取得に失敗');
    // フォールバック: ファイルシステムのみ
    return await getAllTags();
  }
}

/**
 * ハイブリッド方式で関連記事を取得
 */
export async function getRelatedPostsHybrid(slug: string, limit = 3): Promise<BlogPostMeta[]> {
  try {
    // まずデータベースから検索
    const dbPost = await getBlogPostFromDB(slug);
    if (dbPost) {
      const dbRelated = await getRelatedPostsFromDB(slug, limit);
      return dbRelated.map(convertDBPostToBlogPost);
    }

    // データベースに見つからない場合はファイルシステムから検索
    const fileRelated = await getRelatedPosts(slug, limit);
    return fileRelated.map(post => ({
      ...post,
      source: 'file' as const,
    }));

  } catch (error) {
    logger.error({ error, slug }, 'ハイブリッド関連記事の取得に失敗');
    // フォールバック: ファイルシステムのみ
    const fileRelated = await getRelatedPosts(slug, limit);
    return fileRelated.map(post => ({
      ...post,
      source: 'file' as const,
    }));
  }
}
