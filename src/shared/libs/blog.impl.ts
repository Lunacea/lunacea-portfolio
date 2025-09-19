import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { extractTableOfContents, parseMarkdownToHtml } from './mdx-parser';
import { parseMDXToHtml, extractTableOfContentsFromMDX } from './mdx-remote';
import 'server-only';
import { logger } from '@/shared/libs/Logger';
import { sanitizeHtmlServerSide } from '@/shared/utils/sanitize';

export type BlogPost = {
  slug: string;
  title: string;
  description?: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  readingTime: string;
  content: string;
  htmlContent?: string;
  tableOfContents?: Array<{ id: string; title: string; level: number }>;
  excerpt?: string;
  isMDX?: boolean; // MDXファイルかどうかのフラグ
  ogImage?: string | { url: string; width?: number; height?: number; alt?: string };
  coverImage?: string;
  hasMath?: boolean;
};

export type BlogPostMeta = Omit<BlogPost, 'content' | 'htmlContent'>;

const BLOG_CONTENT_PATH = path.resolve(process.cwd(), 'content', 'blog');

function ensureBlogDirectory(): void {
  try {
    if (!fs.existsSync(BLOG_CONTENT_PATH)) {
      logger.warn(`ブログディレクトリが見つかりません: ${BLOG_CONTENT_PATH}`);
      // ディレクトリが存在しない場合は作成を試行
      fs.mkdirSync(BLOG_CONTENT_PATH, { recursive: true });
      logger.info(`ブログディレクトリを作成しました: ${BLOG_CONTENT_PATH}`);
    }
  } catch (error) {
    logger.error({ error }, 'ブログディレクトリの確認・作成に失敗');
  }
}

function getSlugFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/, '');
}

function detectHasMath(markdown: string): boolean {
  try {
    // ブロック数式 $$...$$ や \[ ... \]
    if (/\$\$[\s\S]*?\$\$/m.test(markdown)) return true;
    if (/\\\[[\s\S]*?\\\]/m.test(markdown)) return true;
    // インライン数式 $...$ や \( ... \)（英数字・演算子・\command を含む場合を優先）
    // 価格表記等の誤検出を減らすため、演算子やバックスラッシュを含むものに限定
    if (/(^|\s)\$[^$\n]*?[+\-*/=^\\][^$\n]*?\$(?=\s|[.,;:!?)]|$)/m.test(markdown)) return true;
    if (/\\\([^)]*?[+\-*/=^\\][^)]*?\\\)/m.test(markdown)) return true;
    // KaTeX コマンドの気配
    if (/\\(frac|sum|int|alpha|beta|gamma|pi|theta|phi|infty|sqrt)\b/.test(markdown)) return true;
  } catch {}
  return false;
}

export function getBlogPostFiles(): string[] {
  ensureBlogDirectory();
  try {
    // パスの存在確認を追加
    if (!fs.existsSync(BLOG_CONTENT_PATH)) {
      logger.warn(`ブログディレクトリが存在しません: ${BLOG_CONTENT_PATH}`);
      return [];
    }

    const files = fs.readdirSync(BLOG_CONTENT_PATH);
    return files.filter(file => file.endsWith('.mdx') || file.endsWith('.md'));
  } catch (error) {
    logger.error({ error }, 'ブログディレクトリの読み取りに失敗');
    return [];
  }
}

export async function parseBlogPost(filename: string): Promise<BlogPost> {
  const filePath = path.resolve(BLOG_CONTENT_PATH, filename);
  try {
    // ファイルの存在確認を追加
    if (!fs.existsSync(filePath)) {
      logger.warn(`ファイルが見つかりません: ${filePath}`);
      throw new Error(`ファイルが見つかりません: ${filename}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    const slug = getSlugFromFilename(filename);
    const readingTimeResult = readingTime(content);
    const isMDX = filename.endsWith('.mdx');

    const rawExcerpt = content.split('\n\n')[0]?.replace(/^#+\s/, '') || data.description || '';
    const cleanExcerpt = rawExcerpt
      .replace(/[#*_`~[\]]/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    let htmlContent = '';
    let tableOfContents: Array<{ id: string; title: string; level: number }> = [];
    const hasMath = detectHasMath(content);
    
    try {
      if (isMDX) {
        // MDXファイルの場合はHTMLに変換
        htmlContent = await parseMDXToHtml(content);
        tableOfContents = extractTableOfContentsFromMDX(content);
      } else {
        // Markdownファイルの場合は従来通り
        htmlContent = await parseMarkdownToHtml(content);
        tableOfContents = extractTableOfContents(content);
      }
      // 生成されたHTMLをサーバー側でサニタイズしておく
      htmlContent = sanitizeHtmlServerSide(htmlContent);
    } catch (parseError) {
      logger.error({ parseError, filename }, 'コンテンツ変換エラー');
      htmlContent = `<pre class="error-fallback">${content}</pre>`;
    }

    return {
      slug,
      title: data.title || slug,
      description: data.description,
      publishedAt: data.publishedAt || data.date || new Date().toISOString(),
      updatedAt: data.updatedAt,
      tags: data.tags || [],
      readingTime: readingTimeResult.text,
      content,
      htmlContent,
      tableOfContents,
      excerpt: cleanExcerpt.length > 200 ? `${cleanExcerpt.substring(0, 200)}...` : cleanExcerpt,
      isMDX,
      ogImage: data.ogImage,
      coverImage: data.coverImage,
      hasMath,
    };
  } catch (error) {
    logger.error({ error, filename }, 'ブログ記事の解析エラー');
    const slug = getSlugFromFilename(filename);
    return {
      slug,
      title: slug,
      description: 'エラーが発生しました',
      publishedAt: new Date().toISOString(),
      tags: [],
      readingTime: '1 min read',
      content: 'エラーが発生したため、コンテンツを読み込めませんでした。',
      htmlContent: '<p>エラーが発生したため、コンテンツを読み込めませんでした。</p>',
      tableOfContents: [],
      excerpt: 'エラーが発生しました',
      isMDX: false,
      ogImage: undefined,
      coverImage: undefined,
      hasMath: false,
    };
  }
}

// メタ情報のみを軽量に取得（HTML変換・TOC抽出なし）
export async function parseBlogPostMeta(filename: string): Promise<BlogPostMeta> {
  const filePath = path.resolve(BLOG_CONTENT_PATH, filename);
  try {
    if (!fs.existsSync(filePath)) {
      logger.warn(`ファイルが見つかりません: ${filePath}`);
      throw new Error(`ファイルが見つかりません: ${filename}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    const slug = getSlugFromFilename(filename);
    const readingTimeResult = readingTime(content);

    const rawExcerpt = content.split('\n\n')[0]?.replace(/^#+\s/, '') || data.description || '';
    const cleanExcerpt = rawExcerpt
      .replace(/[#*_`~[\]]/g, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    const hasMath = detectHasMath(content);
    return {
      slug,
      title: data.title || slug,
      description: data.description,
      publishedAt: data.publishedAt || data.date || new Date().toISOString(),
      updatedAt: data.updatedAt,
      tags: data.tags || [],
      readingTime: readingTimeResult.text,
      tableOfContents: undefined,
      excerpt: cleanExcerpt.length > 200 ? `${cleanExcerpt.substring(0, 200)}...` : cleanExcerpt,
      isMDX: filename.endsWith('.mdx'),
      ogImage: data.ogImage,
      coverImage: data.coverImage,
      hasMath,
    };
  } catch (error) {
    logger.error({ error, filename }, 'ブログ記事メタの解析エラー');
    const slug = getSlugFromFilename(filename);
    return {
      slug,
      title: slug,
      description: 'エラーが発生しました',
      publishedAt: new Date().toISOString(),
      tags: [],
      readingTime: '1 min read',
      tableOfContents: [],
      excerpt: 'エラーが発生しました',
      isMDX: false,
      ogImage: undefined,
      coverImage: undefined,
    };
  }
}

export async function getAllBlogPosts(): Promise<BlogPostMeta[]> {
  const files = getBlogPostFiles();
  const posts = await Promise.all(files.map(async (filename) => {
    const meta = await parseBlogPostMeta(filename);
    return meta;
  }));
  return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const files = getBlogPostFiles();
  const targetFile = files.find(file => getSlugFromFilename(file) === slug);
  if (!targetFile) {
    return null;
  }
  return await parseBlogPost(targetFile);
}

export async function getBlogPostsByTag(tag: string): Promise<BlogPostMeta[]> {
  const allPosts = await getAllBlogPosts();
  return allPosts.filter(post => post.tags.includes(tag));
}

export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllBlogPosts();
  const allTags = allPosts.flatMap(post => post.tags);
  return Array.from(new Set(allTags)).sort();
}

export function formatDate(dateString: string, locale = 'ja'): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(locale, options);
}

/**
 * タグの共通数で関連記事を抽出（自身は除外）
 */
export async function getRelatedPosts(slug: string, limit = 3): Promise<BlogPostMeta[]> {
  const all = await getAllBlogPosts();
  const current = all.find(p => p.slug === slug);
  if (!current) return [];
  const scored = all
    .filter(p => p.slug !== slug)
    .map(p => {
      const common = p.tags.filter(tag => current.tags.includes(tag)).length;
      return { post: p, score: common };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime())
    .slice(0, limit)
    .map(x => x.post);
  return scored;
}
