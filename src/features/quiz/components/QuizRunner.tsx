'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { Quiz } from '@/features/quiz/types';
import { useQuizRunner } from '@/features/quiz/hooks/useQuizRunner';

type Props = {
    quizzes: Quiz[];
    onCompletedAction?: (summary: { score: number; total: number }) => void;
};

export default function QuizRunner({ quizzes, onCompletedAction }: Props) {
	const t = useTranslations('Quiz');
	const locale = useLocale();
	const { current, total, state, selected, answer, next, prev, reset } = useQuizRunner(quizzes);
	const [submitted, setSubmitted] = useState(false);

	const stem = useMemo(() => (locale === 'ja' ? current?.stemJa : current?.stemEn), [locale, current]);
	const explanation = useMemo(() => (locale === 'ja' ? current?.explanationJa : current?.explanationEn), [locale, current]);

	if (!current) {
		return <p className="text-muted-foreground">{t('empty')}</p>;
	}

	const isMulti = current.type === 'multi';
	const name = `quiz-${current.id}`;

	return (
		<div className="space-y-4" aria-live="polite">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">{state.currentIndex + 1} / {total}</p>
				{state.completed && (
					<p className="text-sm font-medium">{t('your_score', { score: state.score, total })}</p>
				)}
			</div>
			<article>
				<header className="mb-2">
					<h3 className="text-lg font-semibold">{stem}</h3>
				</header>
				{current.code && (
					<pre className="rounded-md bg-card p-3 border text-sm overflow-x-auto"><code>{current.code}</code></pre>
				)}
				{current.choices && (
					<fieldset aria-label={isMulti ? t('select_many') : t('select_one')}>
						<legend className="sr-only">{isMulti ? t('select_many') : t('select_one')}</legend>
						{isMulti ? (
							<div role="group" className="mt-3 grid gap-2">
								{current.choices.map(choice => {
								const label = locale === 'ja' ? choice.labelJa : choice.labelEn;
								const id = `${name}-${choice.key}`;
								const checked = Array.isArray(selected) ? selected.includes(choice.key) : selected === choice.key;
								return (
									<label key={choice.key} htmlFor={id} className="flex items-center gap-2 rounded-md border p-3 hover:bg-accent/20 cursor-pointer">
										<input
											id={id}
											name={name}
											type={isMulti ? 'checkbox' : 'radio'}
											checked={checked}
											onChange={e => {
												if (isMulti) {
													const prev = Array.isArray(selected) ? selected : [];
													const nextVal = e.currentTarget.checked ? [...prev, choice.key] : prev.filter(k => k !== choice.key);
													answer(nextVal);
												} else {
													answer(choice.key);
												}
											}}
											className="h-4 w-4"
										/>
										<span className="text-sm">{label}</span>
									</label>
								);
							})}
						</div>
						) : (
							<div role="radiogroup" className="mt-3 grid gap-2">
								{current.choices.map(choice => {
									const label = locale === 'ja' ? choice.labelJa : choice.labelEn;
									const id = `${name}-${choice.key}`;
									const checked = Array.isArray(selected) ? selected.includes(choice.key) : selected === choice.key;
									return (
										<label key={choice.key} htmlFor={id} className="flex items-center gap-2 rounded-md border p-3 hover:bg-accent/20 cursor-pointer">
											<input
												id={id}
												name={name}
												type="radio"
												checked={checked}
												onChange={() => {
													answer(choice.key);
												}}
												className="h-4 w-4"
											/>
											<span className="text-sm">{label}</span>
										</label>
									);
								})}
							</div>
						)}
					</fieldset>
				)}
			</article>
			<footer className="flex items-center gap-2">
				<button type="button" className="inline-flex items-center justify-center rounded-md bg-card text-foreground px-4 h-10 border hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
					disabled={state.currentIndex === 0}
					onClick={() => { prev(); }}
				>
					{t('previous')}
				</button>
				<button type="button" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 h-10 border hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
					onClick={() => {
						if (state.currentIndex + 1 < total) {
							setSubmitted(false);
							next();
						} else {
                        setSubmitted(true);
                        onCompletedAction?.({ score: state.score, total });
						}
					}}
				>
					{state.currentIndex + 1 < total ? t('next') : t('submit')}
				</button>
				{state.completed && (
					<button type="button" className="inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground px-4 h-10 border hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all"
						onClick={() => reset()}
					>
						{t('try_again')}
					</button>
				)}
			</footer>
			{(state.completed || submitted) && (
				<section className="mt-4 rounded-md border p-3">
					<h4 className="font-medium mb-2">{t('explanation')}</h4>
					<p className="text-sm whitespace-pre-wrap">{explanation}</p>
				</section>
			)}
		</div>
	);
}


