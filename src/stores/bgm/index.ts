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
  } catch (error) {
    console.warn('Audio analysis setup failed:', error);
  }
};

// === BGMの初期化 ===
const initBGM = (): void => {
  if (typeof window === 'undefined') {
    console.warn('🎵 BGM initialization skipped (SSR)');
    return;
  }

  if (howlInstance) {
    console.warn('🎵 BGM already initialized');
    return;
  }

  try {
    console.warn('🎵 Initializing BGM...');

    howlInstance = new Howl({
      src: ['/assets/sound/bgm.mp3'],
      loop: true,
      volume: 0.7,
      html5: true,
      preload: false,
      pool: 1,
      autoplay: false,
      onload: () => {
        console.warn('🎵 BGM loaded successfully');
        initAudioAnalysis();
      },
      onloaderror: (_, error) => {
        console.error('❌ BGM load error:', error);
        console.error('❌ Check if BGM file exists at: /assets/sound/bgm.mp3');
      },
      onplayerror: (_, error) => {
        console.error('❌ BGM play error:', error);
      },
    });

    console.warn('🎵 Howl instance created successfully');
  } catch (error) {
    console.error('❌ Failed to create Howl instance:', error);
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
    audioContext.close().catch(console.warn);
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
      // BGM初期化をクライアントサイドで遅延実行
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          console.warn('🎵 Delayed BGM initialization');
          initBGM();
        }, 100);
      }

      return {
        // === 初期状態 ===
        isPlaying: false,
        isLoading: false,
        volume: 0.7,
        hasUserConsent: null,
        isInitialized: false,
        frequencyData: null,

        // === アクション ===
        requestUserConsent: () => {
          console.warn('🎵 User consent requested');
        },

        grantConsent: () => {
          set({ hasUserConsent: true }, false, 'bgm/grantConsent');
          get().play();
        },

        denyConsent: () => {
          set({ hasUserConsent: false }, false, 'bgm/denyConsent');
        },

        play: () => {
          if (!howlInstance) {
            console.warn('🎵 Howl instance not found, attempting re-initialization...');
            set({ isInitialized: false }, false, 'bgm/initializationStart');
            initBGM();

            // 短い遅延後に再試行
            setTimeout(() => {
              if (!howlInstance) {
                console.error('❌ Howl instance not initialized and re-initialization failed');
                set({ isLoading: false, isInitialized: false }, false, 'bgm/playError');
              } else {
                console.warn('🎵 Re-initialization successful, attempting play...');
                set({ isInitialized: true }, false, 'bgm/initializationSuccess');
                get().play(); // 再帰的に呼び出し
              }
            }, 200);
            return;
          }

          set({ isLoading: true }, false, 'bgm/playStart');

          try {
            if (audioContext?.state === 'suspended') {
              audioContext.resume().then(() => {
                console.warn('🎵 Audio context resumed');
              }).catch((error) => {
                console.error('❌ Audio context resume failed:', error);
              });
            }

            howlInstance.play();
            set({ isPlaying: true, isLoading: false, isInitialized: true }, false, 'bgm/playSuccess');
          } catch (error) {
            console.error('❌ BGM play error:', error);
            set({ isPlaying: false, isLoading: false }, false, 'bgm/playError');
          }
        },

        pause: () => {
          if (!howlInstance) {
            return;
          }

          howlInstance.pause();
          set({ isPlaying: false }, false, 'bgm/pause');
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
