import { quizSchema, type Quiz } from '@/features/quiz/types';

const rawQuizzes: Quiz[] = [
	{
		id: 'ts-keyof-as-const',
		topic: 'TypeScript',
		tags: ['keyof', 'const assertions'],
		difficulty: 'beginner',
		type: 'single',
		stemJa: '次の型Tは何になりますか？',
		stemEn: 'What is the resulting type T?',
		code: 'const x = { a: 1, b: 2 } as const;\n type T = keyof typeof x;',
		choices: [
			{ key: 'a', labelJa: '"a" | "b" | string', labelEn: '"a" | "b" | string' },
			{ key: 'b', labelJa: '"a" | "b"', labelEn: '"a" | "b"' },
			{ key: 'c', labelJa: 'number', labelEn: 'number' },
			{ key: 'd', labelJa: 'never', labelEn: 'never' },
		],
		answer: 'b',
		explanationJa: 'as const によりリテラル推論が行われ、keyof は "a" | "b" となります。',
		explanationEn: 'const assertion enables literal inference, so keyof becomes "a" | "b".',
		references: ['https://www.typescriptlang.org/docs/handbook/2/keyof-types.html', 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions'],
		env: { typescript: '>=5.0' },
	},
	{
		id: 'fetch-http-error',
		topic: 'HTTP',
		tags: ['fetch', 'error handling'],
		difficulty: 'beginner',
		type: 'single',
		stemJa: 'fetch は 404 のときどう振る舞いますか？',
		stemEn: 'How does fetch behave on 404?',
		code: 'const res = await fetch("/not-found");',
		choices: [
			{ key: 'a', labelJa: 'Promise が reject される', labelEn: 'Promise rejects' },
			{ key: 'b', labelJa: 'resolve し ok=false', labelEn: 'resolves with ok=false' },
			{ key: 'c', labelJa: '5xx のみ reject', labelEn: 'rejects only on 5xx' },
			{ key: 'd', labelJa: '常に throw', labelEn: 'always throws' },
		],
		answer: 'b',
		explanationJa: 'HTTPエラーは resolve し、response.ok が false になります。',
		explanationEn: 'HTTP errors resolve; response.ok becomes false.',
		references: ['https://developer.mozilla.org/docs/Web/API/Fetch_API/Using_Fetch#checking_that_the_fetch_was_successful'],
		env: { node: '>=18' },
	},
	{
		id: 'rsc-boundary',
		topic: 'Next.js',
		tags: ['RSC', 'server actions'],
		difficulty: 'intermediate',
		type: 'multi',
		stemJa: 'RSCで完結できる処理はどれ？（複数選択）',
		stemEn: 'Which can be done in RSC? (multi)',
		choices: [
			{ key: 'a', labelJa: 'DBクエリ', labelEn: 'DB query' },
			{ key: 'b', labelJa: 'useStateでのUI操作', labelEn: 'UI interaction with useState' },
			{ key: 'c', labelJa: '認証トークンの検証', labelEn: 'Auth token verification' },
			{ key: 'd', labelJa: 'DOMイベントハンドリング', labelEn: 'DOM event handling' },
		],
		answer: ['a', 'c'],
		explanationJa: 'サーバー専用処理（DB/認証検証）はRSC。UI操作・DOMイベントはClient。',
		explanationEn: 'Server-only tasks (DB/auth) in RSC; UI/DOM are Client.',
		references: ['https://react.dev/reference/rsc'],
		env: { next: '>=15' },
	},
];

export const quizzes: Quiz[] = rawQuizzes.map(q => quizSchema.parse(q));


