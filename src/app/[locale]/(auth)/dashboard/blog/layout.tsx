import { getTranslations, setRequestLocale } from 'next-intl/server';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';

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
        {children}
      </div>
    </div>
  );
}
