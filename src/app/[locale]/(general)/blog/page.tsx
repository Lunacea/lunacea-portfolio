import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import BlogPageClient from './BlogPageClient';
import { getAllBlogPostsHybrid } from '@/shared/libs/blog';

type BlogPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export const revalidate = 3600; // 1時間でISR

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Blog' });

  const posts = await getAllBlogPostsHybrid();

  return (
    <BlogPageClient 
      posts={posts} 
      t={{
        preparing_title: t('preparing_title'),
        preparing_description: t('preparing_description'),
      }}
    />
  );
}
