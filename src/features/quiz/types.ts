import { z } from 'zod';

export const quizChoiceSchema = z.object({
	key: z.string().min(1),
	labelJa: z.string().min(1),
	labelEn: z.string().min(1),
});

export const quizSchema = z.object({
	id: z.string().min(1),
	locale: z.enum(['ja', 'en']).optional(),
	topic: z.enum(['TypeScript', 'React', 'Next.js', 'Node.js', 'HTTP', 'DB', 'Testing', 'Security', 'Architecture']).describe('primary topic'),
	tags: z.array(z.string()).default([]),
	difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
	type: z.enum(['single', 'multi', 'predict', 'diff']),
	stemJa: z.string().min(1),
	stemEn: z.string().min(1),
	code: z.string().optional(),
	choices: z.array(quizChoiceSchema).optional(),
	answer: z.union([
		z.string(),
		z.array(z.string()).min(1),
	]).describe('key or keys of correct choices, or free-form for predict/diff'),
	explanationJa: z.string().min(1),
	explanationEn: z.string().min(1),
	references: z.array(z.string().url()).default([]),
	env: z.object({
		typescript: z.string().optional(),
		next: z.string().optional(),
		node: z.string().optional(),
	}).default({}),
});

export type Quiz = z.infer<typeof quizSchema>;
export type QuizChoice = z.infer<typeof quizChoiceSchema>;

export function isCorrectAnswer(userAnswer: string | string[], correct: Quiz['answer']): boolean {
	if (Array.isArray(correct)) {
		const ua = Array.isArray(userAnswer) ? [...userAnswer].sort() : [userAnswer].sort();
		const ca = [...correct].sort();
		return ua.length === ca.length && ua.every((v, i) => v === ca[i]);
	}
	return Array.isArray(userAnswer) ? userAnswer.length === 1 && userAnswer[0] === correct : userAnswer === correct;
}


