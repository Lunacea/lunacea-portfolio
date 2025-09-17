import { useCallback, useMemo, useReducer } from 'react';
import { type Quiz, isCorrectAnswer } from '@/features/quiz/types';

type State = {
	currentIndex: number;
	userAnswers: Record<string, string | string[]>;
	completed: boolean;
	score: number;
};

type Action =
	| { type: 'answer'; quizId: string; value: string | string[]; correct: Quiz['answer'] }
	| { type: 'next'; total: number }
	| { type: 'prev' }
	| { type: 'reset' };

function reducer(prev: State, action: Action): State {
	switch (action.type) {
		case 'answer': {
			const isCorrect = isCorrectAnswer(action.value, action.correct);
			const already = prev.userAnswers[action.quizId] !== undefined;
			return {
				...prev,
				userAnswers: { ...prev.userAnswers, [action.quizId]: action.value },
				score: already ? prev.score : (isCorrect ? prev.score + 1 : prev.score),
			};
		}
		case 'next': {
			const nextIndex = prev.currentIndex + 1;
			return {
				...prev,
				currentIndex: nextIndex,
				completed: nextIndex >= action.total,
			};
		}
		case 'prev': {
			const prevIndex = Math.max(0, prev.currentIndex - 1);
			return { ...prev, currentIndex: prevIndex };
		}
		case 'reset':
			return { currentIndex: 0, userAnswers: {}, completed: false, score: 0 };
		default:
			return prev;
	}
}

export function useQuizRunner(quizzes: Quiz[]) {
	const [state, dispatch] = useReducer(reducer, { currentIndex: 0, userAnswers: {}, completed: false, score: 0 });
	const total = quizzes.length;
	const current = useMemo(() => quizzes[state.currentIndex], [quizzes, state.currentIndex]);

	const answer = useCallback((value: string | string[]) => {
		if (!current) return;
		dispatch({ type: 'answer', quizId: current.id, value, correct: current.answer });
	}, [current]);

	const next = useCallback(() => {
		dispatch({ type: 'next', total });
	}, [total]);

	const prev = useCallback(() => {
		dispatch({ type: 'prev' });
	}, []);

	const reset = useCallback(() => {
		dispatch({ type: 'reset' });
	}, []);

	const selected = current ? state.userAnswers[current.id] : undefined;

	return { state, total, current, selected, answer, next, prev, reset } as const;
}


