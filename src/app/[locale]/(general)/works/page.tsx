import { getTranslations, setRequestLocale } from 'next-intl/server';
import { WorksGallery } from '@/components/WorksGallery';

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
  const t = await getTranslations({
    locale,
    namespace: 'Works',
  });

  // プロジェクトデータ
  const projects = [
    {
      id: 'lunacea-portfolio',
      title: 'Lunacea Portfolio',
      description: t('project_description_1'),
      image: '/assets/images/screencapture-lunacea-jp-en-2025-06-10-01_16_24.png',
      technologies: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
      url: 'https://lunacea.jp',
      github: 'https://github.com/lunacea/lunacea-portfolio',
    },
    {
      id: 'tsuna-agri',
      title: 'TsunaAgri',
      description: t('project_description_2'),
      image: '/assets/images/tsuna-agri.png',
      technologies: ['Svelte', 'Drizzlekit', 'Hono.js', 'Docker'],
      github: 'https://github.com/lunacea/takizawa-hackathon7',
    },
  ];

  return (
    <WorksGallery projects={projects} />
  );
}
