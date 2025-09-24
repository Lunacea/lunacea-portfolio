import { auth } from '@/shared/libs/auth-server';
import { redirect } from 'next/navigation';
import AdminBlogSearch from '@/features/blog/admin/components/BlogSearch';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '記事検索 - ブログエディター',
  description: '記事を検索・フィルタリングして管理します',
};

export default async function SearchPage() {
  // 認証チェック
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">記事検索</h1>
        <p className="text-muted-foreground mt-2">
          タイトル、内容、タグで記事を検索できます
        </p>
      </div>
      
      <AdminBlogSearch />
    </div>
  );
}

