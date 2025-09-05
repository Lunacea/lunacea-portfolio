import { getTranslations } from 'next-intl/server';

export type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  url?: string;
  github?: string;
};

export async function getProjects(locale: string): Promise<Project[]> {
  const t = await getTranslations({ locale, namespace: 'Works' });
  return [
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
    {
      id: 'cooooster',
      title: 'Cooooster',
      description: t('project_description_3'),
      image: '/assets/images/cooooster.png',
      technologies: ['Next.js', 'TypeScript', 'Supabase', 'Cloudflare Pages', 'Drizzle'],
      github: 'https://github.com/Lunacea/cooooster',
    },
  ];
}
