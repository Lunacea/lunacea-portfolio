# BGMシステム ドキュメント

## 概要

このプロジェクトのBGMシステムは、Webサイトでシームレスな音楽再生体験を提供します。ページ遷移時も音楽が途切れることなく、ユーザーフレンドリーな音量調整とミュート機能を備えています。

## 主な機能

- ✅ **ページ遷移時の継続再生**: Next.js App Routerに対応
- ✅ **ユーザー許可システム**: 初回訪問時の許可ダイアログ
- ✅ **音量調整**: スライダーによる細かい音量制御
- ✅ **ミュート機能**: ワンクリックでの音声ON/OFF
- ✅ **設定の永続化**: localStorage使用
- ✅ **アクセシビリティ対応**: ARIA属性とキーボード操作
- ✅ **エラーハンドリング**: 包括的なエラー管理
- ✅ **TypeScript完全対応**: 型安全な実装

## アーキテクチャ

### コンポーネント構成

```
src/components/audio/
├── BGMPlayer.tsx           # メインコンポーネント
├── BGMPlayerWrapper.tsx    # SSR対応ラッパー
├── BGMPermissionDialog.tsx # 許可ダイアログ
└── BGMControlPanel.tsx     # コントロールパネル
```

### 状態管理

```
src/stores/
└── bgmStore.ts            # Zustand store
```

### カスタムフック

```
src/hooks/
├── useBGMControls.ts      # BGM操作ロジック
└── useDebounce.ts         # デバウンス機能
```

### ユーティリティ

```
src/utils/
├── bgmErrorHandler.ts     # エラーハンドリング
└── bgmTestUtils.ts        # テスト用ユーティリティ
```

### 型定義

```
src/types/
└── bgm.ts                 # BGM関連の型定義
```

## 使用方法

### 基本的な設定

1. **BGMファイルの配置**
   ```
   public/assets/sound/bgm.mp3
   ```

2. **コンポーネントの配置**
   ```tsx
   // app/layout.tsx
   import { BGMPlayerWrapper } from '@/components/audio/BGMPlayerWrapper';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <BGMPlayerWrapper />
         </body>
       </html>
     );
   }
   ```

### カスタマイズ

#### BGM設定の変更

```tsx
// src/types/bgm.ts
export const DEFAULT_BGM_CONFIG: BGMConfig = {
  bgmPath: '/assets/sound/your-bgm.mp3',
  defaultVolume: 0.5, // 0-1の範囲
  fadeTime: 2000, // フェード時間（ms）
  autoPlay: true, // 自動再生
  loop: true, // ループ再生
  preload: false, // プリロード
  html5: false, // HTML5オーディオ使用
};
```

#### UIのカスタマイズ

```tsx
// BGMControlPanel.tsxをカスタマイズ
<Card className="your-custom-styles">
  {/* カスタムUI */}
</Card>;
```

## API リファレンス

### useBGMControls Hook

```tsx
const {
  // 状態
  permissionStatus, // 'granted' | 'denied' | null
  isPlaying, // boolean
  volume, // number (0-1)
  isMuted, // boolean
  shouldShowDialog, // boolean
  shouldShowControls, // boolean

  // アクション
  handlePermission, // (allow: boolean) => void
  handleTogglePlayback, // (event?) => void
  handleVolumeChange, // (values: number[]) => void
  handleMuteToggle, // (event?) => void
} = useBGMControls();
```

### BGMStore Actions

```tsx
import { useBGMStore } from '@/stores/bgm';

// 直接ストアアクションを呼び出し
useBGMStore.getState().playAudio();
useBGMStore.getState().pauseAudio();
useBGMStore.getState().setVolume(0.5);
useBGMStore.getState().toggleMute();
```

## テスト

### モック環境の使用

```tsx
import { createBGMTestEnvironment, MockBGMPlayer } from '@/utils/bgmTestUtils';

// テスト環境のセットアップ
const testEnv = createBGMTestEnvironment();

// モックプレイヤーの作成
const mockPlayer = new MockBGMPlayer({
  duration: 60,
  autoToggle: true,
  simulateErrors: false,
});

// テスト後のクリーンアップ
testEnv.cleanup();
mockPlayer.destroy();
```

## トラブルシューティング

### よくある問題

1. **音声が再生されない**
   - ブラウザの自動再生ポリシーを確認
   - ユーザーインタラクション後に再生を試行
   - AudioContextの状態を確認

2. **ページ遷移時に音声が途切れる**
   - BGMPlayerWrapperが正しく配置されているか確認
   - Next.js App Routerを使用しているか確認

3. **音量調整が効かない**
   - Howlerインスタンスが正しく初期化されているか確認
   - ミュート状態でないか確認

### デバッグ

開発環境では詳細なログが出力されます：

```javascript
// ブラウザコンソールで確認
console.warn('[BGMStore] ...');
console.warn('[BGMPlayer] ...');
console.warn('[BGMControls] ...');
```

### エラー監視

```tsx
import { BGMErrorHandler } from '@/utils/bgmErrorHandler';

// エラー履歴の確認
const errors = BGMErrorHandler.getErrors();
const latestError = BGMErrorHandler.getLatestError();
const hasRecentErrors = BGMErrorHandler.hasRecentErrors(5); // 5分以内
```

## パフォーマンス最適化

### 推奨設定

- **プリロード**: 必要な場合のみ有効化
- **HTML5オーディオ**: モバイルでは無効化推奨
- **フェード時間**: 1000ms以下を推奨
- **デバウンス**: 音量調整に300ms程度のデバウンスを適用

### メモリ管理

```tsx
// コンポーネントアンマウント時のクリーンアップ
useEffect(() => {
  return () => {
    cleanupBGM(); // ストアからエクスポート
  };
}, []);
```

## ブラウザ対応

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ⚠️ IE: 非対応

## ライセンス

このBGMシステムは、プロジェクトのライセンスに従います。

## 貢献

バグ報告や機能要望は、GitHubのIssueでお知らせください。
