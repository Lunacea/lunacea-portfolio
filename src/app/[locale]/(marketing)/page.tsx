import DraggableCard from '@/components/ui/DraggableCard';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexProps) {
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

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  // 翻訳を取得し、実際にDraggableCardのpropsに使用
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return (
    <DraggableCard
      title={t('draggable_card_title')}
      description={t('draggable_card_description')}
    />
  );
}
