import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createBlogPost, updateBlogPost, deleteBlogPost } from '@/features/blogEditor/actions/blogActions';
import { generateOGImage, saveOGImage } from '@/shared/libs/ogImageGenerator';

// モック設定
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: vi.fn(() => ({
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => [{ id: 1, slug: 'test-post', title: 'Test Post' }]),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => []),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
  })),
}));

vi.mock('postgres', () => ({
  default: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/og', () => ({
  ImageResponse: vi.fn(() => ({
    arrayBuffer: vi.fn(() => Promise.resolve(new ArrayBuffer(1024))),
  })),
}));

vi.mock('fs', () => ({
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  existsSync: vi.fn(() => false),
}));

vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
}));

describe('Blog Editor Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createBlogPost', () => {
    it('should create a new blog post successfully', async () => {
      // モックの設定
      const mockAuth = await import('@clerk/nextjs/server');
      vi.mocked(mockAuth.auth).mockResolvedValue({ userId: 'user123' });

      const formData = new FormData();
      formData.append('title', 'Test Post');
      formData.append('description', 'Test Description');
      formData.append('content', '# Test Content\n\nThis is a test post.');
      formData.append('tags', JSON.stringify(['test', 'blog']));
      formData.append('status', 'published');

      const result = await createBlogPost(formData);

      expect(result.success).toBe(true);
      expect(result.postId).toBe(1);
    });

    it('should return error when user is not authenticated', async () => {
      const mockAuth = await import('@clerk/nextjs/server');
      vi.mocked(mockAuth.auth).mockResolvedValue({ userId: null });

      const formData = new FormData();
      formData.append('title', 'Test Post');
      formData.append('content', 'Test Content');

      const result = await createBlogPost(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('認証が必要です');
    });

    it('should return error when title is missing', async () => {
      const mockAuth = await import('@clerk/nextjs/server');
      vi.mocked(mockAuth.auth).mockResolvedValue({ userId: 'user123' });

      const formData = new FormData();
      formData.append('content', 'Test Content');

      const result = await createBlogPost(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('タイトルとコンテンツは必須です');
    });

    it('should return error when content is missing', async () => {
      const mockAuth = await import('@clerk/nextjs/server');
      vi.mocked(mockAuth.auth).mockResolvedValue({ userId: 'user123' });

      const formData = new FormData();
      formData.append('title', 'Test Post');

      const result = await createBlogPost(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('タイトルとコンテンツは必須です');
    });
  });

  describe('updateBlogPost', () => {
    it('should update an existing blog post successfully', async () => {
      const mockAuth = await import('@clerk/nextjs/server');
      vi.mocked(mockAuth.auth).mockResolvedValue({ userId: 'user123' });

      // 既存記事のモック
      const mockDb = await import('drizzle-orm/postgres-js');
      const mockDrizzle = vi.mocked(mockDb.drizzle);
      const mockDbInstance = mockDrizzle();
      
      vi.mocked(mockDbInstance.select().from().where().limit).mockResolvedValue([{
        id: 1,
        slug: 'test-post',
        title: 'Original Title',
        authorId: 'user123',
        publishedAt: null,
        isPublished: false,
      }]);

      const formData = new FormData();
      formData.append('title', 'Updated Post');
      formData.append('description', 'Updated Description');
      formData.append('content', '# Updated Content\n\nThis is updated content.');
      formData.append('tags', JSON.stringify(['updated', 'blog']));
      formData.append('status', 'published');

      const result = await updateBlogPost(1, formData);

      expect(result.success).toBe(true);
    });

    it('should return error when post does not exist', async () => {
      const mockAuth = await import('@clerk/nextjs/server');
      vi.mocked(mockAuth.auth).mockResolvedValue({ userId: 'user123' });

      // 記事が見つからない場合のモック
      const mockDb = await import('drizzle-orm/postgres-js');
      const mockDrizzle = vi.mocked(mockDb.drizzle);
      const mockDbInstance = mockDrizzle();
      
      vi.mocked(mockDbInstance.select().from().where().limit).mockResolvedValue([]);

      const formData = new FormData();
      formData.append('title', 'Updated Post');
      formData.append('content', 'Updated Content');

      const result = await updateBlogPost(999, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('記事が見つかりません');
    });

    it('should return error when user does not have permission', async () => {
      const mockAuth = await import('@clerk/nextjs/server');
      vi.mocked(mockAuth.auth).mockResolvedValue({ userId: 'user123' });

      // 他のユーザーの記事のモック
      const mockDb = await import('drizzle-orm/postgres-js');
      const mockDrizzle = vi.mocked(mockDb.drizzle);
      const mockDbInstance = mockDrizzle();
      
      vi.mocked(mockDbInstance.select().from().where().limit).mockResolvedValue([{
        id: 1,
        slug: 'test-post',
        title: 'Original Title',
        authorId: 'other-user',
        publishedAt: null,
        isPublished: false,
      }]);

      const formData = new FormData();
      formData.append('title', 'Updated Post');
      formData.append('content', 'Updated Content');

      const result = await updateBlogPost(1, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('この記事を編集する権限がありません');
    });
  });

  describe('deleteBlogPost', () => {
    it('should delete a blog post successfully', async () => {
      const mockAuth = await import('@clerk/nextjs/server');
      vi.mocked(mockAuth.auth).mockResolvedValue({ userId: 'user123' });

      // 既存記事のモック
      const mockDb = await import('drizzle-orm/postgres-js');
      const mockDrizzle = vi.mocked(mockDb.drizzle);
      const mockDbInstance = mockDrizzle();
      
      vi.mocked(mockDbInstance.select().from().where().limit).mockResolvedValue([{
        id: 1,
        slug: 'test-post',
        title: 'Test Post',
        authorId: 'user123',
      }]);

      const result = await deleteBlogPost(1);

      expect(result.success).toBe(true);
    });

    it('should return error when post does not exist', async () => {
      const mockAuth = await import('@clerk/nextjs/server');
      vi.mocked(mockAuth.auth).mockResolvedValue({ userId: 'user123' });

      // 記事が見つからない場合のモック
      const mockDb = await import('drizzle-orm/postgres-js');
      const mockDrizzle = vi.mocked(mockDb.drizzle);
      const mockDbInstance = mockDrizzle();
      
      vi.mocked(mockDbInstance.select().from().where().limit).mockResolvedValue([]);

      const result = await deleteBlogPost(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('記事が見つかりません');
    });
  });
});

describe('OG Image Generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateOGImage', () => {
    it('should generate OGP image successfully', async () => {
      const slug = 'test-post';
      const title = 'Test Post Title';

      const result = await generateOGImage(slug, title);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });

    it('should handle long titles by truncating', async () => {
      const slug = 'test-post';
      const longTitle = 'This is a very long title that should be truncated when it exceeds the maximum length limit';

      const result = await generateOGImage(slug, longTitle);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBeGreaterThan(0);
    });
  });

  describe('saveOGImage', () => {
    it('should save OGP image to filesystem', async () => {
      const slug = 'test-post';
      const title = 'Test Post Title';

      const result = await saveOGImage(slug, title);

      expect(result).toBe('/og-images/test-post.png');
    });

    it('should create output directory if it does not exist', async () => {
      const slug = 'test-post';
      const title = 'Test Post Title';

      const mockFs = await import('fs');
      vi.mocked(mockFs.existsSync).mockReturnValue(false);

      await saveOGImage(slug, title);

      expect(mockFs.mkdirSync).toHaveBeenCalled();
    });
  });
});

