# GitHub Environments設定ガイド

## 概要

本リポジトリでは、GitHub Environmentsを使用してデプロイメントの安全性と制御性を向上させています。

## 環境設定

### 1. Production環境

- **保護ルール**: 必須
- **レビュー要件**: 1名以上の承認が必要
- **デプロイブランチ**: `main`ブランチのみ
- **手動承認**: 有効

#### 設定手順

1. GitHubリポジトリの「Settings」→「Environments」に移動
2. 「New environment」をクリック
3. 環境名: `production`
4. 「Required reviewers」を有効化し、承認者を設定
5. 「Deployment branches」で `main`ブランチのみを許可

### 2. Staging環境

- **保護ルール**: 任意
- **レビュー要件**: なし
- **デプロイブランチ**: `main`, `develop`ブランチ
- **手動承認**: なし

#### 設定手順:staging

1. GitHubリポジトリの「Settings」→「Environments」に移動
2. 「New environment」をクリック
3. 環境名: `staging`
4. 保護ルールは設定しない（自動デプロイ用）

## 環境変数とSecrets

### Production環境

```bash
# 必須Secrets
DATABASE_URL=postgresql://...
DEPLOY_TOKEN=your-deploy-token
SENTRY_AUTH_TOKEN=your-sentry-token
CLERK_SECRET_KEY=your-clerk-secret
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-public-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://your-app.com/sign-in

# 環境変数
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.com
```

### Staging環境

```bash
# 必須Secrets
DATABASE_URL=postgresql://staging...
DEPLOY_TOKEN=your-staging-deploy-token
SENTRY_AUTH_TOKEN=your-sentry-token
CLERK_SECRET_KEY=your-staging-clerk-secret
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-staging-clerk-public-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://staging.your-app.com/sign-in

# 環境変数
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.your-app.com
```

## デプロイメントフロー

### 自動デプロイ

1. `main`ブランチへのプッシュ
2. CIパイプラインの成功
3. Staging環境への自動デプロイ
4. Production環境への手動承認待ち

### 手動デプロイ

1. GitHub Actionsの「CD Pipeline」ワークフローを手動実行
2. 環境を選択（staging/production）
3. 必要に応じてマイグレーションをスキップ
4. Production環境の場合は承認が必要

## セキュリティ考慮事項

### 最小権限の原則

- 各環境で必要なSecretsのみを設定
- 本番環境のSecretsは定期的にローテーション
- アクセスログの監視

### 監査とコンプライアンス

- デプロイメント履歴の保持
- 承認者の記録
- 環境間でのSecretsの分離

## トラブルシューティング

### よくある問題

1. **承認待ちでデプロイが止まる**

   - Production環境の承認者に連絡
   - 承認者の設定を確認
2. **Secretsが見つからない**

   - 環境固有のSecretsが設定されているか確認
   - Secrets名の大文字小文字を確認
3. **デプロイが失敗する**

   - ログを確認してエラーを特定
   - 環境変数の設定を確認

### ロールバック手順

1. 前のバージョンのコミットを特定
2. 該当コミットから手動デプロイを実行
3. データベースマイグレーションが必要な場合は注意深く実行
