# Lunacea Portfolio

[![English](https://img.shields.io/badge/Language-English-blue?style=flat-square)](README.md)
[![日本語](https://img.shields.io/badge/Language-日本語-red?style=flat-square)](README.ja.md)

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE.txt)

Lunaceaのポートフォリオサイトです。
インタラクティブな3D表現やモダンなUI/UXを取り入れたWebアプリケーションを目指しています。

🌐 **サイトURL**: [https://lunacea.jp](https://lunacea.jp)

## 📜 About

このプロジェクトは、Lunaceaの技術的なスキルセットと制作実績を示すためのポートフォリオサイトです。
Next.jsを中心としたモダンな技術スタックで構築されています。

## 🛠️ Tech Stack

- **フレームワーク**: Next.js (v15.x), React (v19.x)
- **言語**: TypeScript (v5.x)
- **スタイリング**: Tailwind CSS (v4.x), PostCSS
- **3Dグラフィックス**: Three.js, React Three Fiber
- **データベース**: Drizzle ORM (pg, pglite)
- **認証**: Clerk (Next.js)
- **テスト**: Vitest, Playwright, Testing Library, Storybook
- **その他主要ライブラリ**: Zod, React Hook Form

## 🚀 Setup

### ✅ 前提条件

[![Bun](https://img.shields.io/badge/Bun-1.x-purple?style=flat-square&logo=bun)](https://bun.sh/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-bluegreen?style=flat-square&logo=node.js)](https://nodejs.org/)

### 📋 手順

1. リポジトリをクローンします:

   ```bash
   git clone https://github.com/yourusername/lunacea-portfolio.git
   cd lunacea-portfolio
   ```

2. 依存関係をインストールします:

   ```bash
   bun install
   ```

3. 環境変数ファイルを作成します:

   ```bash
   cp .env .env.local
   cp .env.production .env.production.local
   ```

4. 各ファイル内の必要な値（APIキーなど）を適宜設定

   > **注意**: `.env.local` と `.env.production.local` は `.gitignore` に含まれており、公開リポジトリにプッシュされることはありません。認証情報やAPIキーはこれらのファイルに安全に保存できます。

## 💻 Development

このプロジェクトは[Bun](https://bun.sh/)を使用したモダンなNext.jsアプリケーションです。

### 🔄 開発サイクル

1. **ローカル開発サーバーの起動**:

   ```bash
   # Next.js開発サーバー（Turboモード有効）
   bun run dev:next

   # または、すべての開発ツールを同時に起動（推奨）
   bun run dev
   ```

   > 💡 `bun run dev` は `dev:next` と `dev:spotlight` を並行して実行し、Spotlightデバッグツールも利用できるようになります。

2. **コードの編集**:
   - `src/` ディレクトリ内のコードを編集すると、ホットリロードによって変更が即座に反映されます
   - TypeScriptの型チェックはエディタと開発サーバーで自動的に行われます

3. **データベース操作** (必要な場合):

   ```bash
   # スキーマ変更からマイグレーションを生成
   bun run db:generate

   # データベースマイグレーションの実行
   bun run db:migrate

   # データベース管理UIの起動
   bun run db:studio
   ```

4. **テストの実行**:

   ```bash
   # ユニットテスト/コンポーネントテストの実行
   bun run test

   # E2Eテストの実行（Playwrightを使用）
   bun run test:e2e
   ```

### 📦 ビルドとプレビュー

本番環境と同様のビルドをローカルで作成し、テストできます:

```bash
# プロジェクトのビルド
bun run build

# ビルドされたアプリケーションの起動
bun run start
```

## 🌐 Deploy

このプロジェクトは[Sevalla](https://sevalla.com/)にGitHub経由でデプロイされています。

1. 変更をコミットし、`main` ブランチにプッシュします。
2. SevallaがGitHubリポジトリの変更を検知し、自動的にビルドとデプロイを実行します。
3. デプロイ後、[https://lunacea.jp](https://lunacea.jp) で最新版が公開されます。

### 🏷️ Blog タグ機能

- 一覧: `/[locale]/blog/tag`（`localePrefix: as-needed` のため既定ロケールは `/blog/tag`）
- 詳細: `/[locale]/blog/tag/[tag]`
- 記事の `frontmatter` の `tags: string[]` を元に自動生成されます。
- i18n キーは `src/shared/locales/{ja,en}.json` の `Blog` 名前空間に追加済み。

## 🆕 追加機能（Blog）

### コードコピー（Copy button）

- 記事内の `pre > code` に自動でコピーボタンを注入します。
- 実装: `src/features/blog/components/CodeCopyEnhancer.tsx`
- i18n: `Blog.copy`, `Blog.copied`

### 記事評価（Like/Dislike）

- UI: 記事本文下部に Like/Dislike ボタンを表示（`PostRating`）。
- API: `GET /api/v1/ratings?slug=...`（集計）, `POST /api/v1/ratings`（投票）
- 投票制約: 同一 `dailyId` かつ同一 `slug` に対し、UTC日付毎に1票（409を返却）
- スキーマ: `post_rating_votes`（Drizzle）
  - `slug`, `voteValue('up'|'down')`, `dailyId`, `tripcode`, `voteDay(YYYY-MM-DD)`, `votedAt`
  - ユニークインデックス: `(slug, daily_id, vote_day)`
- マイグレーション手順:

  ```bash
  bun run db:migrate
  ```

  生成ファイル: `migrations/0003_add_post_rating_votes.sql`

### 関連記事（Related posts）

- タグの共通数による簡易スコアリングで関連記事を最大3件表示。
- 実装: `getRelatedPosts(slug, limit)` in `src/shared/libs/blog.impl.ts`
- 表示: 記事ページ下部にカードリンクを表示。

## ✅ 検証

- Lint/Typecheck/Test:

  ```bash
  bun run lint && bun run typecheck && bun run test
  ```

- E2Eは必要に応じて `bun run test:e2e`

## 📧 Contact

質問やフィードバックは以下のメールアドレスまでお願いします：
[contact@lunacea.jp](mailto:contact@lunacea.jp)

## 📄 License

このプロジェクトは[Next.js Boilerplate](https://github.com/ixartz/Next-js-Boilerplate)を利用して作成されています。ライセンスの詳細は `LICENSE.txt` をご確認ください。