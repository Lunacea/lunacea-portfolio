import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaAngleLeft, FaHashtag } from 'react-icons/fa';
import BlogCard from '@/features/blog/components/BlogCard';
import Icon from '@/shared/components/ui/Icon';
import ScrollReveal from '@/shared/components/ui/ScrollReveal';
import { getAllTags, getBlogPostsByTag } from '@/shared/libs/blog';

type TagPageProps = {
  params: Promise<{ locale: string; tag: string }>;
};

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map(tag => ({ tag }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { locale, tag } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  const decodedTag = decodeURIComponent(tag);
  return {
    title: t('tag_meta_title', { tag: decodedTag }),
    description: t('tag_meta_description', { tag: decodedTag }),
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { locale, tag } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Blog' });
  const decodedTag = decodeURIComponent(tag);
  const posts = await getBlogPostsByTag(decodedTag);

  if (!posts) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <nav className="mb-8">
          <Link
            href="/blog/tag"
            className="inline-flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300 rounded-lg hover:bg-card/50 backdrop-blur-sm"
          >
            <Icon icon={<FaAngleLeft />} className="text-primary" />
            <span>{t('all_tags_link')}</span>
          </Link>
        </nav>

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Icon icon={<FaHashtag />} className="text-primary" />
            <span>{decodedTag}</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('tag_heading_description', { tag: decodedTag })}
          </p>
        </header>

        <ScrollReveal direction="fade" delay={150}>
          {posts.length === 0
            ? (
                <p className="text-muted-foreground">{t('no_posts_for_tag', { tag: decodedTag })}</p>
              )
            : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map(post => (
                    <BlogCard key={post.slug} post={post} />
                  ))}
                </div>
              )}
        </ScrollReveal>
      </div>
    </div>
  );
}
