import { notFound, redirect } from 'next/navigation';
import { auth } from '@/shared/libs/auth-server';
import { db } from '@/shared/libs/blog-db';
import { blogPosts } from '@/shared/models/Schema';
import { eq } from 'drizzle-orm';
import BlogEditorForm from '@/features/blog/admin/components/BlogEditorForm';
import VersionHistory from '@/features/blog/admin/components/VersionHistory';
import { Metadata } from 'next';

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EditPageProps): Promise<Metadata> {
  const { slug } = await params;
  
      const post = await db.select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);

  if (post.length === 0) {
    return {
      title: '記事が見つかりません',
    };
  }

  return {
    title: `${post[0]?.title} - 編集`,
    description: post[0]?.description || 'ブログ記事の編集',
  };
}

export default async function EditBlogPostPage({ params }: EditPageProps) {
  const { slug } = await params;
  
  // 認証チェック
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // 記事の取得
      const post = await db.select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);

  if (post.length === 0) {
    notFound();
  }

  // 権限チェック（作成者のみ編集可能）
  if (post[0]?.authorId !== userId) {
    redirect('/dashboard/blog');
  }

  const blogPost = post[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">記事を編集</h1>
        <p className="text-muted-foreground mt-2">
          「{blogPost.title}」の編集
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <BlogEditorForm 
            initialData={{
              id: blogPost.id,
              title: blogPost.title,
              description: blogPost.description || '',
              content: blogPost.content,
              tags: blogPost.tags?.join(', ') || '',
              status: blogPost.status as 'draft' | 'published',
            }}
          />
        </div>
        <div className="lg:col-span-1">
          <VersionHistory postId={blogPost.id} />
        </div>
      </div>
    </div>
  );
}
