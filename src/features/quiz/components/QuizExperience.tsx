'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Quiz } from '@/features/quiz/types';
import ShareButtons from '@/features/blog/shared/components/ShareButtons';
import QuizRunner from '@/features/quiz/components/QuizRunner';

type Props = {
	quizzes: Quiz[];
	share: { slug: string; title: string; absoluteUrl: string };
};

export default function QuizExperience({ quizzes, share }: Props) {
    const t = useTranslations('Quiz');
	const [phase, setPhase] = useState<'select' | 'run' | 'result'>('select');
	const [selectedTopic, setSelectedTopic] = useState<Quiz['topic'] | 'all'>('all');
	const [filtered, setFiltered] = useState<Quiz[]>(quizzes);
	const [lastSummary, setLastSummary] = useState<{ score: number; total: number } | null>(null);

	const topics = useMemo(() => {
		const s = new Set<Quiz['topic']>(quizzes.map(q => q.topic));
		return ['all', ...Array.from(s)] as const;
	}, [quizzes]);

	const handleStart = () => {
		const list = selectedTopic === 'all' ? quizzes : quizzes.filter(q => q.topic === selectedTopic);
		setFiltered(list);
		setPhase('run');
	};

	const handleCompleted = (summary: { score: number; total: number }) => {
		setLastSummary(summary);
		setPhase('result');
	};

	return (
		<div className="space-y-6">
			{phase === 'select' && (
				<section>
					<h3 className="text-lg font-semibold mb-2">{t('choose_topic')}</h3>
					<div className="flex flex-wrap gap-2">
						{topics.map(tpc => (
							<button
								key={tpc}
								type="button"
								className={`px-3 h-9 rounded-md border ${selectedTopic === tpc ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground'}`}
                            onClick={() => setSelectedTopic(tpc as Quiz['topic'] | 'all')}
							>
								{tpc}
							</button>
						))}
					</div>
					<div className="mt-4">
						<button type="button" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 h-10 border hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
							onClick={handleStart}
						>
							{t('start_quiz')}
						</button>
					</div>
					<div className="mt-4">
						<ShareButtons slug={share.slug} title={share.title} absoluteUrl={share.absoluteUrl} />
					</div>
				</section>
			)}
			{phase === 'run' && (
				<QuizRunner quizzes={filtered} onCompletedAction={handleCompleted} />
			)}
			{phase === 'result' && lastSummary && (
				<section className="space-y-3">
					<p className="text-sm font-medium">{t('your_score', { score: lastSummary.score, total: lastSummary.total })}</p>
					<div className="flex items-center gap-2">
						<button type="button" className="inline-flex items-center justify-center rounded-md bg-card text-foreground px-4 h-10 border hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
							onClick={() => { setPhase('select'); }}
						>
							{t('try_again')}
						</button>
						<button type="button" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 h-10 border hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
							onClick={() => { setPhase('run'); }}
						>
							{t('start')}
						</button>
					</div>
					<div className="mt-2">
						<ShareButtons slug={share.slug} title={share.title} absoluteUrl={share.absoluteUrl} />
					</div>
				</section>
			)}
		</div>
	);
}


