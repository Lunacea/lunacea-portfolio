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

## 📧 Contact

質問やフィードバックは以下のメールアドレスまでお願いします：
[contact@lunacea.jp](mailto:contact@lunacea.jp)

## 📄 License

このプロジェクトは[Next.js Boilerplate](https://github.com/ixartz/Next-js-Boilerplate)を利用して作成されています。ライセンスの詳細は `LICENSE.txt` をご確認ください。
