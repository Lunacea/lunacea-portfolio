import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import ModernAudioVisualizer from '@/components/core/ModernAudioVisualizer';
import { ScrollController } from '@/components/core/ScrollController';
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
    <>
      <ScrollController disableScroll={true} />
      {/* ThemeToggleへのクリックヒント - LUNACEAのCの斜め下に配置 */}
      <div className="flex mx-auto pr-12 items-baseline gap-2 text-rose-600/80 dark:text-rose-500/80 justify-center rotate-[-5deg]">
        <span className="text-2xl whitespace-nowrap font-handwriting font-semibold">
          touch here!
        </span>
        <Image
          src="/assets/images/arrow_upright_rose600.png"
          alt="手書き風矢印"
          width={60}
          height={60}
          className="opacity-80"
        />
      </div>
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <ModernAudioVisualizer size={600} className="mx-auto" />
      </div>
      <LatestUpdates locale={locale} />
    </>
  );
}
