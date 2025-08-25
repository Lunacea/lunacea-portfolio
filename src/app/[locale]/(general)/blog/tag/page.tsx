import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { FaAngleLeft, FaHashtag } from 'react-icons/fa';
import EmptyStateCard from '@/shared/components/ui/EmptyStateCard';
import Icon from '@/shared/components/ui/Icon';
import ScrollReveal from '@/shared/components/ui/ScrollReveal';
import { getAllTags } from '@/shared/libs/blog';

type TagIndexPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: TagIndexPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  return {
    title: t('tags_meta_title'),
    description: t('tags_meta_description'),
  };
}
export default async function TagIndexPage({ params }: TagIndexPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Blog' });

  const tags = await getAllTags();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <nav className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300 rounded-lg hover:bg-card/50 backdrop-blur-sm"
          >
            <Icon icon={<FaAngleLeft />} className="text-primary" />
            <span>{t('all_posts')}</span>
          </Link>
        </nav>
        <header className="text-center mb-12">
          <ScrollReveal direction="fade" delay={100}>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{t('all_tags_title')}</h1>
            <p className="text-muted-foreground">{t('all_tags_description')}</p>
          </ScrollReveal>
        </header>

        <ScrollReveal direction="fade" delay={200}>
          {tags.length === 0
            ? (
                <EmptyStateCard
                  icon={<Icon icon={<FaHashtag />} className="text-foreground text-4xl" />}
                  title={t('no_tags_title')}
                  description={t('no_tags_description')}
                />
              )
            : (
                <ul className="flex flex-wrap gap-3">
                  {tags.map(tag => (
                    <li key={tag}>
                      <Link
                        href={`/blog/tag/${encodeURIComponent(tag)}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/60 hover:bg-card transition-colors text-sm"
                        aria-label={`${t('view_tag')}: ${tag}`}
                      >
                        <Icon icon={<FaHashtag />} className="text-primary" />
                        <span>{tag}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
        </ScrollReveal>
      </div>
    </div>
  );
}
