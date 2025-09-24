import { auth } from '@/shared/libs/auth-server';
import { redirect } from 'next/navigation';
import CommentManager from '@/features/blog/admin/components/CommentManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'コメント管理 - ブログエディター',
  description: '記事のコメントを管理します',
};

export default async function CommentsPage() {
  // 認証チェック
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">コメント管理</h1>
        <p className="text-muted-foreground mt-2">
          記事に投稿されたコメントを管理できます
        </p>
      </div>
      
      <CommentManager />
    </div>
  );
}

