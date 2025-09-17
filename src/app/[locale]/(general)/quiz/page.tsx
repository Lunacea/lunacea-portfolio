import { getTranslations, getLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { quizzes } from '@/features/quiz/data/sample';
import QuizExperience from '@/features/quiz/components/QuizExperience';
import { Env } from '@/shared/libs/Env';
import { AppConfig } from '@/shared/utils/AppConfig';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('Quiz');
	return {
		title: t('meta_title'),
		description: t('meta_description'),
		openGraph: {
			title: t('meta_title'),
			description: t('meta_description'),
		},
	};
}

export default async function QuizPage() {
    const t = await getTranslations('Quiz');
    const locale = await getLocale();
    const path = locale === AppConfig.defaultLocale ? '/quiz' : `/${locale}/quiz`;
    const absoluteUrl = new URL(path, Env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').toString();
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: t('meta_title'),
        description: t('meta_description'),
        url: absoluteUrl,
    } as const;
    return (
        <section className="px-4 sm:px-6 md:px-8">
            <header className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">{t('title')}</h2>
                <p className="text-muted-foreground">{t('weekly_quiz')}</p>
            </header>
            <div className="space-y-6">
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
                {quizzes.length === 0 && (
                    <p className="text-muted-foreground">{t('empty')}</p>
                )}
                {quizzes.length > 0 && (
                    <QuizExperience quizzes={quizzes} share={{ slug: 'quiz', title: t('title'), absoluteUrl }} />
                )}
            </div>
        </section>
    );
}


