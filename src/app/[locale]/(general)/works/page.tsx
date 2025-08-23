import { getTranslations, setRequestLocale } from 'next-intl/server';
import { WorksGallery } from '@/features/project/components/WorksGallery';
import { getProjects } from '@/features/project/server/getProjects';

type IWorksProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata(props: IWorksProps) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Works',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Works(props: IWorksProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  // プロジェクトデータ（Server provider）
  const projects = await getProjects(locale);

  return (
    <WorksGallery projects={projects} />
  );
}
