import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import Icon from '@/shared/components/ui/Icon';

type BlogEditorLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BlogEditor' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function BlogEditorLayout({ children, params }: BlogEditorLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <nav className="mb-6">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300 rounded-lg hover:bg-card/50 backdrop-blur-sm"
            >
              <Icon icon={<FaArrowLeft />} className="text-primary" />
              ダッシュボードに戻る
            </Link>
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
