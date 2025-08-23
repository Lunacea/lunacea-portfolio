import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { extractTableOfContents, parseMarkdownToHtml } from './mdx-parser';
import 'server-only';

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
};

export type BlogPostMeta = Omit<BlogPost, 'content' | 'htmlContent'>;

const BLOG_CONTENT_PATH = path.join(process.cwd(), 'content', 'blog');

function ensureBlogDirectory(): void {
  if (!fs.existsSync(BLOG_CONTENT_PATH)) {
    console.warn(`ブログディレクトリが見つかりません: ${BLOG_CONTENT_PATH}`);
  }
}

function getSlugFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/, '');
}

export function getBlogPostFiles(): string[] {
  ensureBlogDirectory();
  try {
    const files = fs.readdirSync(BLOG_CONTENT_PATH);
    return files.filter(file => file.endsWith('.mdx') || file.endsWith('.md'));
  } catch (error) {
    console.warn('ブログディレクトリの読み取りに失敗:', error);
    return [];
  }
}

export async function parseBlogPost(filename: string): Promise<BlogPost> {
  const filePath = path.join(BLOG_CONTENT_PATH, filename);
  try {
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

    let htmlContent = '';
    let tableOfContents: Array<{ id: string; title: string; level: number }> = [];
    try {
      htmlContent = await parseMarkdownToHtml(content);
      tableOfContents = extractTableOfContents(content);
    } catch (parseError) {
      console.error(`HTML変換エラー (${filename}):`, parseError);
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
    };
  } catch (error) {
    console.error(`ブログ記事の解析エラー (${filename}):`, error);
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
    };
  }
}

export async function getAllBlogPosts(): Promise<BlogPostMeta[]> {
  const files = getBlogPostFiles();
  const posts = await Promise.all(files.map(async (filename) => {
    const post = await parseBlogPost(filename);
    const { content, htmlContent, ...meta } = post;
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

export function formatDate(dateString: string, locale: string = 'ja'): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(locale, options);
}
