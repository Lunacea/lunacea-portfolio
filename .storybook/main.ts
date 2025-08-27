import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-onboarding',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {
      // Next.js 15との互換性を向上
      strictMode: true,
    },
  },
  staticDirs: ['../public'],
  core: {
    disableTelemetry: true,
    // Webpack 5の互換性を向上
    builder: '@storybook/builder-webpack5',
  },
  // Webpack設定の最適化
  webpackFinal: async (config) => {
    // Webpack 5の互換性を確保
    if (config.resolve) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    return config;
  },
};

export default config;
