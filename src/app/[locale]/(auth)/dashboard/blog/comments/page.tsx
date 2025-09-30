import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import CommentsManager from '@/features/blog/admin/components/CommentsManagerModal';

type CommentsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: CommentsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === 'ja' ? `コメント一覧 | Dashboard` : `Comments List | Dashboard` };
}

export default async function CommentsPage({ params }: CommentsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-xl font-semibold mb-4">コメント一覧</h1>
        {/* モーダル用のコンポーネント名だが、一覧UIとして使う */}
        <CommentsManager />
      </div>
    </div>
  );
}




