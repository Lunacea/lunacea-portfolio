import { Howl } from 'howler';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// === 型定義 ===
type BGMState = {
  // 状態
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  hasUserConsent: boolean | null; // null=未確認, true=許可, false=拒否
  isInitialized: boolean; // BGMシステムの初期化状態

  // 音声データ
  frequencyData: Uint8Array | null;
};

type BGMActions = {
  // アクション
  requestUserConsent: () => void;
  grantConsent: () => void;
  denyConsent: () => void;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  updateFrequencyData: () => void;
};

type BGMStore = BGMState & BGMActions;

// === グローバル音声インスタンス ===
let howlInstance: Howl | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array | null = null;

// === 音声解析の初期化 ===
const initAudioAnalysis = (): void => {
  if (!howlInstance || audioContext) {
    return;
  }

  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.8;

    const audioElement = (howlInstance as any)._sounds?.[0]?._node;
    if (audioElement?.tagName === 'AUDIO') {
      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
  } catch {
    // Audio analysis setup failed, ignore
  }
};

// === BGMの初期化 ===
const initBGM = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (howlInstance) {
    return;
  }

  try {
    howlInstance = new Howl({
      src: ['/assets/sound/bg.mp3'],
      loop: true,
      volume: 0.7,
      html5: true,
      preload: false,
      pool: 1,
      autoplay: false,
      onload: () => {
        initAudioAnalysis();
      },
      onloaderror: (error) => {
        console.warn('BGM読み込みエラー:', error);
      },
      onplayerror: (error) => {
        console.warn('BGM再生エラー:', error);
        // エラー時は再生状態をリセット（ストア定義後に実行されるため安全）
        setTimeout(() => {
          if (typeof window !== 'undefined' && (window as any).bgmStore) {
            (window as any).bgmStore.getState().pause();
          }
        }, 0);
      },
    });
  } catch (error) {
    console.warn('Howlインスタンス作成失敗:', error);
    howlInstance = null;
  }
};

// === クリーンアップ関数 ===
const cleanup = (): void => {
  if (howlInstance) {
    howlInstance.unload();
    howlInstance = null;
  }
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close().catch(() => { /* ignore */ });
    audioContext = null;
  }
  analyser = null;
  dataArray = null;
};

// === ブラウザ離脱時のクリーンアップ ===
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanup);
}

// === Zustandストア ===
export const useBGMStore = create<BGMStore>()(
  devtools(
    (set, get) => {
      let initialUserConsent: boolean | null = null;
      if (typeof window !== 'undefined') {
        // 同一ドメインからの遷移か確認
        const referrer = document.referrer;
        const currentOrigin = window.location.origin;

        if (referrer) {
          try {
            const referrerOrigin = new URL(referrer).origin;
            if (referrerOrigin === currentOrigin) {
              initialUserConsent = true;
            }
          } catch {
            // Could not parse referrer URL, ignore
          }
        }

        // BGM初期化をクライアントサイドで遅延実行
        setTimeout(() => {
          initBGM();
          // グローバル参照を設定（エラーハンドリング用）
          (window as any).bgmStore = useBGMStore;
        }, 100);
      }

      return {
        // === 初期状態 ===
        isPlaying: false,
        isLoading: false,
        volume: 0.7,
        hasUserConsent: initialUserConsent,
        isInitialized: false,
        frequencyData: null,

        // === アクション ===
        requestUserConsent: () => {
          // User consent requested, do nothing
        },

        grantConsent: () => {
          set({ hasUserConsent: true }, false, 'bgm/grantConsent');
          get().play();
        },

        denyConsent: () => {
          set({ hasUserConsent: false }, false, 'bgm/denyConsent');
        },

        play: () => {
          const state = get();

          // ユーザー同意がない場合は再生しない
          if (!state.hasUserConsent) {
            console.warn('BGM再生: ユーザー同意が必要です');
            return;
          }

          if (!howlInstance) {
            set({ isInitialized: false }, false, 'bgm/initializationStart');
            initBGM();

            // 短い遅延後に再試行
            setTimeout(() => {
              if (!howlInstance) {
                console.warn('BGM初期化に失敗しました');
                set({ isLoading: false, isInitialized: false }, false, 'bgm/playError');
              } else {
                set({ isInitialized: true }, false, 'bgm/initializationSuccess');
                get().play(); // 再帰的に呼び出し
              }
            }, 200);
            return;
          }

          set({ isLoading: true }, false, 'bgm/playStart');

          try {
            if (audioContext?.state === 'suspended') {
              audioContext.resume().catch((error) => {
                console.warn('AudioContextの再開に失敗:', error);
              });
            }

            howlInstance.play();
            set({ isPlaying: true, isLoading: false, isInitialized: true }, false, 'bgm/playSuccess');
          } catch (error) {
            console.warn('BGM再生エラー:', error);
            set({ isPlaying: false, isLoading: false }, false, 'bgm/playError');
          }
        },

        pause: () => {
          if (!howlInstance) {
            console.warn('BGM停止: インスタンスが存在しません');
            return;
          }

          try {
            howlInstance.pause();
            set({ isPlaying: false }, false, 'bgm/pause');
          } catch (error) {
            console.warn('BGM停止エラー:', error);
            // エラーが発生しても状態はリセット
            set({ isPlaying: false }, false, 'bgm/pauseError');
          }
        },

        setVolume: (volume: number) => {
          const clampedVolume = Math.max(0, Math.min(1, volume));
          if (howlInstance) {
            howlInstance.volume(clampedVolume);
          }
          set({ volume: clampedVolume }, false, 'bgm/setVolume');
        },

        updateFrequencyData: () => {
          if (!analyser || !dataArray) {
            set({ frequencyData: null }, false, 'bgm/updateFrequencyDataNull');
            return;
          }

          analyser.getByteFrequencyData(dataArray);
          set({ frequencyData: new Uint8Array(dataArray) }, false, 'bgm/updateFrequencyData');
        },
      };
    },
    {
      name: 'bgm-store',
    },
  ),
);

// === セレクター（パフォーマンス最適化）===
export const selectIsPlaying = (state: BGMStore) => state.isPlaying;
export const selectVolume = (state: BGMStore) => state.volume;
export const selectHasUserConsent = (state: BGMStore) => state.hasUserConsent;
export const selectFrequencyData = (state: BGMStore) => state.frequencyData;
export const selectIsLoading = (state: BGMStore) => state.isLoading;
export const selectIsInitialized = (state: BGMStore) => state.isInitialized;
