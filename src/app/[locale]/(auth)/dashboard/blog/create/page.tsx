import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import BlogEditorForm from '@/features/blog/admin/components/BlogEditorForm';
import Link from 'next/link';
import Icon from '@/shared/components/ui/Icon';
import { FaAngleLeft } from 'react-icons/fa';

type CreateBlogPostPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BlogEditor' });

  return {
    title: `${t('create_title')} | ${t('meta_title')}`,
    description: t('create_description'),
  };
}

export default async function CreateBlogPostPage({ params }: CreateBlogPostPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen">
      <nav className="container mx-auto px-4 py-6 max-w-7xl">
        <Link
          href="/dashboard/blog"
          className="inline-flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300 rounded-lg hover:bg-card/50 backdrop-blur-sm"
        >
          <Icon icon={<FaAngleLeft />} className="text-primary" />
          <span>戻る</span>
        </Link>
      </nav>

      <div className="container mx-auto px-4 pb-16 max-w-7xl">
        <BlogEditorForm />
      </div>
    </div>
  );
}

