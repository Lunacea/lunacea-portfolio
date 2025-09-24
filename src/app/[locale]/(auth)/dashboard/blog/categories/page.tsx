import { auth } from '@/shared/libs/auth-server';
import { redirect } from 'next/navigation';
import CategoryManager from '@/features/blog/admin/components/CategoryManager';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'カテゴリ管理 - ブログエディター',
  description: '記事のカテゴリ（タグ）を管理します',
};

export default async function CategoriesPage() {
  // 認証チェック
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">カテゴリ管理</h1>
        <p className="text-muted-foreground mt-2">
          記事のタグをカテゴリとして管理できます
        </p>
      </div>
      
      <CategoryManager />
    </div>
  );
}

