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
- ✅ **再生位置の保存**: 一時停止時の位置を記憶
- ✅ **AudioContext対応**: ブラウザ制約への適切な対処

## アーキテクチャ

### コンポーネント構成

```
src/components/audio/
├── BGMPlayer.tsx           # メインコンポーネント
├── BGMClientWrapper.tsx    # クライアントサイド専用ラッパー
├── BGMPermissionDialog.tsx # 許可ダイアログ
└── BGMControlPanel.tsx     # コントロールパネル
```

### 状態管理

```
src/stores/bgm/
├── index.ts               # メインストア（Zustand）
├── types.ts               # 型定義
├── config.ts              # 設定値
└── utils.ts               # ユーティリティ関数
```

### ユーティリティ

```
src/utils/
├── bgmErrorHandler.ts     # エラーハンドリング
└── bgmTestUtils.ts        # テスト用ユーティリティ
```

### カスタムフック

```
src/hooks/
└── useDebounce.ts         # デバウンス機能
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
   import BGMClientWrapper from '@/components/audio/BGMClientWrapper';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <BGMClientWrapper />
         </body>
       </html>
     );
   }
   ```

### カスタマイズ

#### BGM設定の変更

```tsx
// src/stores/bgm/config.ts
export const BGM_CONFIG: BGMConfig = {
  PATH: '/assets/sound/your-bgm.mp3',
  DEFAULT_VOLUME: 0.3, // 0-1の範囲
  LOAD_DELAY: 200, // ロード遅延（ms）
  AUTOPLAY_DELAY: 100, // 自動再生遅延（ms）
  DIALOG_CLOSE_DELAY: 300, // ダイアログ閉じる遅延（ms）
  DIALOG_SHOW_DELAY: 100, // ダイアログ表示遅延（ms）
};
```

#### ストレージキーの変更

```tsx
// src/stores/bgm/config.ts
export const STORAGE_KEYS: StorageKeys = {
  PERMISSION: 'bgm-permission',
  VOLUME: 'bgm-volume',
  MUTE: 'bgm-muted',
};
```

## API リファレンス

### BGMStore

```tsx
import { useBGMStore } from '@/stores/bgm';

// 状態の取得
const permissionStatus = useBGMStore(state => state.permissionStatus);
const isPlaying = useBGMStore(state => state.isPlaying);
const volume = useBGMStore(state => state.volume);
const isMuted = useBGMStore(state => state.isMuted);

// アクションの取得
const handlePermission = useBGMStore(state => state.handlePermission);
const togglePlayback = useBGMStore(state => state.togglePlayback);
const playAudio = useBGMStore(state => state.playAudio);
const pauseAudio = useBGMStore(state => state.pauseAudio);
const setVolume = useBGMStore(state => state.setVolume);
const toggleMute = useBGMStore(state => state.toggleMute);
```

### BGMState型

```tsx
type BGMState = {
  // 状態
  permissionStatus: 'granted' | 'denied' | null;
  isPlaying: boolean;
  needsDialogInteraction: boolean;
  isDialogMounted: boolean;
  isDialogAnimatedVisible: boolean;
  sound: Howl | null;
  volume: number; // 0-1の範囲
  isMuted: boolean;
  isInitialized: boolean;
  savedPosition: number; // 再生位置（秒）

  // アクション
  handlePermission: (allow: boolean) => void;
  togglePlayback: () => void;
  playAudio: () => void;
  pauseAudio: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
};
```

### コンポーネントProps

#### BGMControlPanel

```tsx
type BGMControlPanelProps = {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onTogglePlaybackAction: () => void;
  onVolumeChangeAction: (values: number[]) => void;
  onToggleMuteAction: () => void;
};
```

#### BGMPermissionDialog

```tsx
type BGMPermissionDialogProps = {
  open: boolean;
  onAllowAction: () => void;
  onDenyAction: () => void;
};
```

## 実装の詳細

### 初期化フロー

1. **クライアントサイド検出**: `typeof window !== 'undefined'`でSSR対応
2. **設定読み込み**: localStorageから許可状態、音量、ミュート設定を復元
3. **Howlインスタンス作成**: 音声ファイルの設定
4. **AudioContextアンロック**: ユーザーインタラクション待機
5. **許可ダイアログ表示**: 初回訪問時のみ

### 再生制御

```tsx
// 再生開始
const playAudio = () => {
  // 許可チェック
  if (permissionStatus !== 'granted') return;
  
  // 音量設定
  sound.volume(isMuted ? 0 : volume);
  
  // 再生開始
  const playId = sound.play();
  
  // 保存位置の復元
  if (savedPosition > 0) {
    sound.seek(savedPosition, playId);
  }
};

// 一時停止
const pauseAudio = () => {
  // 現在位置を保存
  const currentPosition = sound.seek();
  setSavedPosition(currentPosition);
  
  // 一時停止
  sound.pause();
};
```

### エラーハンドリング

- **ファイル読み込みエラー**: `onloaderror`コールバック
- **再生エラー**: `onplayerror`コールバック
- **AudioContextエラー**: 自動アンロック処理
- **設定保存エラー**: try-catchでlocalStorageエラーをキャッチ

## テスト

### モック環境の使用

```tsx
import { createBGMTestEnvironment, MockBGMPlayer } from '@/utils/bgmTestUtils';

describe('BGMシステム', () => {
  let testEnv: ReturnType<typeof createBGMTestEnvironment>;
  let mockPlayer: MockBGMPlayer;

  beforeEach(() => {
    testEnv = createBGMTestEnvironment();
    mockPlayer = new MockBGMPlayer({
      duration: 60,
      autoToggle: true,
      simulateErrors: false,
    });
  });

  afterEach(() => {
    testEnv.cleanup();
    mockPlayer.destroy();
  });

  it('should play audio when permission is granted', () => {
    // テストコード
  });
});
```

## トラブルシューティング

### よくある問題

1. **音声が再生されない**
   - ブラウザの自動再生ポリシーを確認
   - ユーザーインタラクション後に再生を試行
   - AudioContextの状態を確認（`Howler.ctx.state`）

2. **ページ遷移時に音声が途切れる**
   - BGMClientWrapperが正しく配置されているか確認
   - Next.js App Routerを使用しているか確認

3. **音量調整が効かない**
   - Howlerインスタンスが正しく初期化されているか確認
   - ミュート状態でないか確認
   - グローバル音量設定を確認

4. **再生位置が正しく復元されない**
   - `savedPosition`の値を確認
   - `sound.seek()`の戻り値を確認
   - 音声ファイルの読み込み状態を確認

### デバッグ

開発環境では詳細なログが出力されます：

```javascript
// ブラウザコンソールで確認
🎵 [BGM] 設定を読み込み完了
🎵 [BGM] BGMファイルの読み込み完了
🎵 [BGM] 再生開始
⚠️ [BGM] 一時停止不可: サウンドオブジェクトがありません
❌ [BGM] 再生エラー
🔍 [BGM Debug] 位置復元
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

- **プリロード**: `preload: false`（必要時のみロード）
- **HTML5オーディオ**: `html5: false`（Web Audio API使用）
- **初期音量**: `volume: 0`（再生時に設定）
- **遅延設定**: 適切な遅延でユーザー体験を向上

### メモリ管理

```tsx
import { cleanupBGM } from '@/stores/bgm';

// コンポーネントアンマウント時のクリーンアップ
useEffect(() => {
  return () => {
    cleanupBGM();
  };
}, []);
```

### 状態管理の最適化

- **セレクター使用**: 必要な状態のみを購読
- **メモ化**: `useCallback`でイベントハンドラーをメモ化
- **バッチ更新**: 複数の状態変更を一度に実行

## ブラウザ対応

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ⚠️ IE: 非対応

### モバイル対応

- iOS Safari: AudioContextの制約に対応
- Android Chrome: 自動再生ポリシーに対応
- タッチイベント: AudioContextアンロック対応

## セキュリティ

- **CSP対応**: `unsafe-eval`不要
- **XSS対策**: 入力値のサニタイズ
- **CORS対応**: 音声ファイルの適切な配信

## ライセンス

このBGMシステムは、プロジェクトのライセンスに従います。

## 貢献

バグ報告や機能要望は、GitHubのIssueでお知らせください。

## 更新履歴

- **v2.0.0**: Zustandベースの新アーキテクチャ
- **v1.5.0**: 再生位置保存機能追加
- **v1.4.0**: AudioContext対応強化
- **v1.3.0**: エラーハンドリング改善
- **v1.2.0**: TypeScript完全対応
- **v1.1.0**: アクセシビリティ対応
- **v1.0.0**: 初期リリース
