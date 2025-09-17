import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import ModernAudioVisualizer from '@/features/bgm/components/ModernAudioVisualizer';
import ScrollController from '@/shared/components/behaviors/ScrollController';
import LatestUpdates from '@/shared/components/layouts/LatestUpdates';
import ThemeToggleHint from '@/shared/components/ui/ThemeToggleHint';
import { Link } from '@/shared/libs/i18nNavigation';

type IIndexPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Index(props: IIndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <>
      <ScrollController disableScroll />
      {/* ThemeToggleへのクリックヒント */}
      <ThemeToggleHint />
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <ModernAudioVisualizer size={600} className="mx-auto" />
      </div>
      <LatestUpdates locale={locale} />
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <Link href="/quiz" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 h-10 border hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all">
          Quiz / 実装力向上クイズへ
        </Link>
      </div>
    </>
  );
}
