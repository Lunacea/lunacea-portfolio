import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getAllBlogPostsHybrid, 
  getBlogPostHybrid, 
  getBlogPostsByTagHybrid, 
  getAllTagsHybrid,
  getRelatedPostsHybrid 
} from '@/shared/libs/blog-hybrid';

// モック設定
vi.mock('@/shared/libs/blog.impl', () => ({
  getAllBlogPosts: vi.fn(),
  getBlogPost: vi.fn(),
  getRelatedPosts: vi.fn(),
  getAllTags: vi.fn(),
  getBlogPostsByTag: vi.fn(),
}));

vi.mock('@/shared/libs/blog-db', () => ({
  getBlogPostsFromDB: vi.fn(),
  getBlogPostFromDB: vi.fn(),
  getRelatedPostsFromDB: vi.fn(),
  getAllTagsFromDB: vi.fn(),
  getBlogPostsByTagFromDB: vi.fn(),
}));

vi.mock('@/shared/libs/Logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Blog Hybrid Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllBlogPostsHybrid', () => {
    it('should merge database and file posts successfully', async () => {
      const mockBlogImpl = await import('@/shared/libs/blog.impl');
      const mockBlogDb = await import('@/shared/libs/blog-db');

      // データベースの記事をモック
      vi.mocked(mockBlogDb.getBlogPostsFromDB).mockResolvedValue([
        {
          id: 1,
          slug: 'db-post',
          title: 'Database Post',
          description: 'A post from database',
          excerpt: 'Database excerpt',
          tags: ['database'],
          publishedAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          status: 'published',
          isPublished: true,
          readingTime: 5,
          viewCount: 100,
          coverImage: null,
          ogImage: null,
          authorId: 'user1',
          metaTitle: 'Database Post',
          metaDescription: 'A post from database',
        },
      ]);

      // ファイルシステムの記事をモック
      vi.mocked(mockBlogImpl.getAllBlogPosts).mockResolvedValue([
        {
          slug: 'file-post',
          title: 'File Post',
          description: 'A post from file system',
          publishedAt: '2024-01-02',
          updatedAt: '2024-01-02',
          tags: ['file'],
          readingTime: '3 min read',
          excerpt: 'File excerpt',
          isMDX: true,
          ogImage: undefined,
          coverImage: undefined,
        },
      ]);

      const result = await getAllBlogPostsHybrid();

      expect(result).toHaveLength(2);
      expect(result[0].slug).toBe('db-post');
      expect(result[0].source).toBe('database');
      expect(result[1].slug).toBe('file-post');
      expect(result[1].source).toBe('file');
    });

    it('should prioritize database posts over file posts when slugs conflict', async () => {
      const mockBlogImpl = await import('@/shared/libs/blog.impl');
      const mockBlogDb = await import('@/shared/libs/blog-db');

      // 同じスラッグの記事をモック
      vi.mocked(mockBlogDb.getBlogPostsFromDB).mockResolvedValue([
        {
          id: 1,
          slug: 'conflict-post',
          title: 'Database Version',
          description: 'Database version',
          excerpt: 'Database excerpt',
          tags: ['database'],
          publishedAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          status: 'published',
          isPublished: true,
          readingTime: 5,
          viewCount: 100,
          coverImage: null,
          ogImage: null,
          authorId: 'user1',
          metaTitle: 'Database Version',
          metaDescription: 'Database version',
        },
      ]);

      vi.mocked(mockBlogImpl.getAllBlogPosts).mockResolvedValue([
        {
          slug: 'conflict-post',
          title: 'File Version',
          description: 'File version',
          publishedAt: '2024-01-02',
          updatedAt: '2024-01-02',
          tags: ['file'],
          readingTime: '3 min read',
          excerpt: 'File excerpt',
          isMDX: true,
          ogImage: undefined,
          coverImage: undefined,
        },
      ]);

      const result = await getAllBlogPostsHybrid();

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('conflict-post');
      expect(result[0].title).toBe('Database Version');
      expect(result[0].source).toBe('database');
    });

    it('should fallback to file posts when database fails', async () => {
      const mockBlogDb = await import('@/shared/libs/blog-db');

      // データベースエラーをモック
      vi.mocked(mockBlogDb.getBlogPostsFromDB).mockRejectedValue(new Error('Database error'));

      const mockBlogImpl = await import('@/shared/libs/blog.impl');
      vi.mocked(mockBlogImpl.getAllBlogPosts).mockResolvedValue([
        {
          slug: 'file-post',
          title: 'File Post',
          description: 'A post from file system',
          publishedAt: '2024-01-02',
          updatedAt: '2024-01-02',
          tags: ['file'],
          readingTime: '3 min read',
          excerpt: 'File excerpt',
          isMDX: true,
          ogImage: undefined,
          coverImage: undefined,
        },
      ]);

      const result = await getAllBlogPostsHybrid();

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('file-post');
      expect(result[0].source).toBe('file');
    });
  });

  describe('getBlogPostHybrid', () => {
    it('should return database post when found', async () => {
      const mockBlogDb = await import('@/shared/libs/blog-db');

      vi.mocked(mockBlogDb.getBlogPostFromDB).mockResolvedValue({
        id: 1,
        slug: 'test-post',
        title: 'Test Post',
        description: 'Test description',
        content: '# Test Content',
        contentHtml: '<h1>Test Content</h1>',
        excerpt: 'Test excerpt',
        tags: ['test'],
        publishedAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        status: 'published',
        isPublished: true,
        readingTime: 5,
        viewCount: 100,
        coverImage: null,
        ogImage: null,
        authorId: 'user1',
        metaTitle: 'Test Post',
        metaDescription: 'Test description',
      });

      const result = await getBlogPostHybrid('test-post');

      expect(result).not.toBeNull();
      expect(result?.slug).toBe('test-post');
      expect(result?.source).toBe('database');
    });

    it('should fallback to file post when not found in database', async () => {
      const mockBlogImpl = await import('@/shared/libs/blog.impl');
      const mockBlogDb = await import('@/shared/libs/blog-db');

      vi.mocked(mockBlogDb.getBlogPostFromDB).mockResolvedValue(null);

      vi.mocked(mockBlogImpl.getBlogPost).mockResolvedValue({
        slug: 'test-post',
        title: 'Test Post',
        description: 'Test description',
        publishedAt: '2024-01-01',
        updatedAt: '2024-01-01',
        tags: ['test'],
        readingTime: '5 min read',
        content: '# Test Content',
        htmlContent: '<h1>Test Content</h1>',
        tableOfContents: [],
        excerpt: 'Test excerpt',
        isMDX: true,
        ogImage: undefined,
        coverImage: undefined,
        hasMath: false,
      });

      const result = await getBlogPostHybrid('test-post');

      expect(result).not.toBeNull();
      expect(result?.slug).toBe('test-post');
      expect(result?.source).toBe('file');
    });

    it('should return null when post not found in both sources', async () => {
      const mockBlogDb = await import('@/shared/libs/blog-db');

      vi.mocked(mockBlogDb.getBlogPostFromDB).mockResolvedValue(null);
      const mockBlogImpl = await import('@/shared/libs/blog.impl');
      vi.mocked(mockBlogImpl.getBlogPost).mockResolvedValue(null);

      const result = await getBlogPostHybrid('non-existent-post');

      expect(result).toBeNull();
    });
  });

  describe('getBlogPostsByTagHybrid', () => {
    it('should merge database and file posts by tag', async () => {
      const mockBlogImpl = await import('@/shared/libs/blog.impl');
      const mockBlogDb = await import('@/shared/libs/blog-db');

      vi.mocked(mockBlogDb.getBlogPostsByTagFromDB).mockResolvedValue([
        {
          id: 1,
          slug: 'db-tag-post',
          title: 'Database Tag Post',
          description: 'A post with tag from database',
          excerpt: 'Database tag excerpt',
          tags: ['javascript'],
          publishedAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          createdAt: new Date('2024-01-01'),
          status: 'published',
          isPublished: true,
          readingTime: 5,
          viewCount: 100,
          coverImage: null,
          ogImage: null,
          authorId: 'user1',
          metaTitle: 'Database Tag Post',
          metaDescription: 'A post with tag from database',
        },
      ]);

      vi.mocked(mockBlogImpl.getBlogPostsByTag).mockResolvedValue([
        {
          slug: 'file-tag-post',
          title: 'File Tag Post',
          description: 'A post with tag from file system',
          publishedAt: '2024-01-02',
          updatedAt: '2024-01-02',
          tags: ['javascript'],
          readingTime: '3 min read',
          excerpt: 'File tag excerpt',
          isMDX: true,
          ogImage: undefined,
          coverImage: undefined,
        },
      ]);

      const result = await getBlogPostsByTagHybrid('javascript');

      expect(result).toHaveLength(2);
      expect(result[0].slug).toBe('db-tag-post');
      expect(result[0].source).toBe('database');
      expect(result[1].slug).toBe('file-tag-post');
      expect(result[1].source).toBe('file');
    });
  });

  describe('getAllTagsHybrid', () => {
    it('should merge tags from both sources', async () => {
      const mockBlogDb = await import('@/shared/libs/blog-db');

      vi.mocked(mockBlogDb.getAllTagsFromDB).mockResolvedValue(['javascript', 'react']);
      const mockBlogImpl = await import('@/shared/libs/blog.impl');
      vi.mocked(mockBlogImpl.getAllTags).mockResolvedValue(['typescript', 'nextjs']);

      const result = await getAllTagsHybrid();

      expect(result).toEqual(['javascript', 'nextjs', 'react', 'typescript']);
    });

    it('should remove duplicates when merging tags', async () => {
      const mockBlogDb = await import('@/shared/libs/blog-db');

      vi.mocked(mockBlogDb.getAllTagsFromDB).mockResolvedValue(['javascript', 'react']);
      const mockBlogImpl = await import('@/shared/libs/blog.impl');
      vi.mocked(mockBlogImpl.getAllTags).mockResolvedValue(['javascript', 'typescript']);

      const result = await getAllTagsHybrid();

      expect(result).toEqual(['javascript', 'react', 'typescript']);
    });
  });

  describe('getRelatedPostsHybrid', () => {
    it('should return related posts from database when post exists in database', async () => {
      const mockBlogDb = await import('@/shared/libs/blog-db');

      vi.mocked(mockBlogDb.getBlogPostFromDB).mockResolvedValue({
        id: 1,
        slug: 'test-post',
        title: 'Test Post',
        description: 'Test description',
        content: '# Test Content',
        contentHtml: '<h1>Test Content</h1>',
        excerpt: 'Test excerpt',
        tags: ['javascript'],
        publishedAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        status: 'published',
        isPublished: true,
        readingTime: 5,
        viewCount: 100,
        coverImage: null,
        ogImage: null,
        authorId: 'user1',
        metaTitle: 'Test Post',
        metaDescription: 'Test description',
      });

      vi.mocked(mockBlogDb.getRelatedPostsFromDB).mockResolvedValue([
        {
          id: 2,
          slug: 'related-post',
          title: 'Related Post',
          description: 'Related description',
          excerpt: 'Related excerpt',
          tags: ['javascript'],
          publishedAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          createdAt: new Date('2024-01-02'),
          status: 'published',
          isPublished: true,
          readingTime: 3,
          viewCount: 50,
          coverImage: null,
          ogImage: null,
          authorId: 'user1',
          metaTitle: 'Related Post',
          metaDescription: 'Related description',
        },
      ]);

      const result = await getRelatedPostsHybrid('test-post', 3);

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('related-post');
      expect(result[0].source).toBe('database');
    });

    it('should fallback to file posts when post not found in database', async () => {
      const mockBlogImpl = await import('@/shared/libs/blog.impl');
      const mockBlogDb = await import('@/shared/libs/blog-db');

      vi.mocked(mockBlogDb.getBlogPostFromDB).mockResolvedValue(null);

      vi.mocked(mockBlogImpl.getRelatedPosts).mockResolvedValue([
        {
          slug: 'file-related-post',
          title: 'File Related Post',
          description: 'File related description',
          publishedAt: '2024-01-02',
          updatedAt: '2024-01-02',
          tags: ['javascript'],
          readingTime: '3 min read',
          excerpt: 'File related excerpt',
          isMDX: true,
          ogImage: undefined,
          coverImage: undefined,
        },
      ]);

      const result = await getRelatedPostsHybrid('test-post', 3);

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('file-related-post');
      expect(result[0].source).toBe('file');
    });
  });

  describe('MDX and Mermaid rendering', () => {
    it('should handle MDX content with custom components', async () => {
      const mockBlogDb = await import('@/shared/libs/blog-db');

      vi.mocked(mockBlogDb.getBlogPostFromDB).mockResolvedValue({
        id: 1,
        slug: 'mdx-test',
        title: 'MDX Test Post',
        description: 'Test MDX content',
        content: `# MDX Test

<div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-lg p-6 my-6">
  <h3 className="text-blue-800 font-semibold mb-3">MDXカスタムボックス</h3>
  <p className="text-blue-700 mb-4">これはMDX内で直接記述されたJSXコンポーネントです。</p>
</div>

\`\`\`mermaid
graph TD
    A[開始] --> B{条件判定}
    B -->|Yes| C[処理A]
    B -->|No| D[処理B]
\`\`\``,
        contentHtml: '<h1>MDX Test</h1><div class="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-lg p-6 my-6"><h3 class="text-blue-800 font-semibold mb-3">MDXカスタムボックス</h3><p class="text-blue-700 mb-4">これはMDX内で直接記述されたJSXコンポーネントです。</p></div><div class="mermaid-placeholder" data-mermaid-content="graph TD%0A    A[開始] --> B{条件判定}%0A    B -->|Yes| C[処理A]%0A    B -->|No| D[処理B]">Mermaid図表をレンダリング中...</div>',
        excerpt: 'MDX test excerpt',
        tags: ['mdx', 'test'],
        publishedAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        status: 'published',
        isPublished: true,
        readingTime: 5,
        viewCount: 100,
        coverImage: null,
        ogImage: null,
        authorId: 'user1',
        metaTitle: 'MDX Test Post',
        metaDescription: 'Test MDX content',
      });

      const result = await getBlogPostHybrid('mdx-test');

      expect(result).not.toBeNull();
      expect(result?.slug).toBe('mdx-test');
      expect(result?.content).toContain('MDXカスタムボックス');
      expect(result?.content).toContain('```mermaid');
      expect(result?.htmlContent).toContain('mermaid-placeholder');
    });
  });
});
