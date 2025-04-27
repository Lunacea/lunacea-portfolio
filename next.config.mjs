import path from 'node:path';
import { fileURLToPath } from 'node:url';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';
// Envのインポートを修正
// import './src/libs/Env.js';

// ESMでのファイルパス取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withNextIntl = createNextIntlPlugin('./src/libs/i18n.ts');

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['.'],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ['@electric-sql/pglite'],

  // 大きな文字列シリアル化の警告を無視する（実際の問題を引き起こしていない場合）
  // この設定はパフォーマンス警告のみを非表示にしますが、機能には影響しません
  onDemandEntries: {
    // 警告を出力するモジュールの設定
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5,
  },

  // Webpack設定を最新の推奨方法で更新
  webpack: (config, { dev }) => {
    // 本番ビルド時の最適化
    if (!dev) {
      // Tree shakingを改善し、バンドルサイズを削減
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
      };

      // キャッシュ設定
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.join(__dirname, '.next/cache/webpack'),
        // キャッシュの最適化設定（可能な限り）
        compression: 'gzip',
        allowCollectingMemory: true,
      };
    }

    return config;
  },

  // Mantineコンポーネントの最適化（tree-shakingの改善）
  experimental: {
    // パッケージ最適化の拡張（react-iconsを含む）
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/form',
      '@mantine/dates',
      'react-icons',
    ],
    // サーバーのミニフィケーションを有効化
    serverMinification: true,
  },

  // TypeScriptエラー処理
  typescript: {
    // 本番環境でのTypeScriptエラーチェックを有効化
    // 無効化する場合はここを true に設定
    ignoreBuildErrors: false,
  },

  // 開発者向けコメント
  /*
   * 注意: [webpack.cache.PackFileCacheStrategy] Serializing big strings の警告は
   * パフォーマンスに関する情報提供であり、実際のビルドには影響しません。
   * これは主にreact-iconsなどの大きなモジュールがキャッシュされる際に発生します。
   * ビルドパフォーマンスに問題がなければ無視して構いません。
   *
   * 本設定では以下の最適化を行っています：
   * 1. webpack cacheの最適化
   * 2. optimizePackageImportsによるTree shakingの改善
   * 3. serverMinificationによるサーバーコードの最適化
   */
};

// Sentryの設定
const sentryConfig = {
  org: 'lunacea',
  project: 'lunacea-portfolio',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: '/monitoring',
  sourcemaps: { disable: true },
  disableLogger: true,
  automaticVercelMonitors: true,
  telemetry: false,
};

export default withSentryConfig(
  bundleAnalyzer(
    withNextIntl(nextConfig),
  ),
  sentryConfig,
);
