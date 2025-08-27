import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      'next/core-web-vitals',
      'next/typescript',
    ],
    settings: {
      next: {
        rootDir: '.',
      },
    },
  }),
  {
    ignores: [
      'migrations/**/*',
      'next-env.d.ts',
      'docs/**/*.md',
      '**/*.md',
      '.next/**/*',
      'dist/**/*',
      'build/**/*',
      '.storybook/**/*',
    ],
  },
  {
    rules: {
      // 基本的な設定
      'react/prefer-destructuring-assignment': 'off',
      
      // TypeScriptの厳格なルール
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // Reactの厳格なルール
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-curly-brace-presence': ['error', 'never'],
      'react/self-closing-comp': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/no-array-index-key': 'error',
      'react/no-unescaped-entities': 'error',
      
      // 一般的な厳格なルール
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-expressions': 'error',
      'no-duplicate-imports': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: 'Use absolute imports instead of relative imports',
            },
          ],
        },
      ],
      'prefer-template': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'no-useless-escape': 'error',
    },
  },
];

export default eslintConfig;
