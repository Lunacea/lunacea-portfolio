import { getTranslations, setRequestLocale } from 'next-intl/server';
import ModernAudioVisualizer from '@/components/core/ModernAudioVisualizer';
import { LatestUpdates } from '@/components/templates/LatestUpdates';

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
    <div className="overflow-hidden">
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <ModernAudioVisualizer size={600} className="mx-auto" />
      </div>
      <LatestUpdates locale={locale} />
    </div>
  );
}
