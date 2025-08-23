import { getTranslations, setRequestLocale } from 'next-intl/server';
import ModernAudioVisualizer from '@/features/bgm/components/ModernAudioVisualizer';
import ScrollController from '@/shared/components/behaviors/ScrollController';
import LatestUpdates from '@/shared/components/layouts/LatestUpdates';
import ThemeToggleHint from '@/shared/components/ui/ThemeToggleHint';

type IIndexPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexPageProps) {
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
      <ScrollController disableScroll={true} />
      {/* ThemeToggleへのクリックヒント */}
      <ThemeToggleHint />
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <ModernAudioVisualizer size={600} className="mx-auto" />
      </div>
      <LatestUpdates locale={locale} />
    </>
  );
}
