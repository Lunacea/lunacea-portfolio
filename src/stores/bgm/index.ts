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
  if (howlInstance) {
    return;
  }

  howlInstance = new Howl({
    src: ['/assets/sound/bgm.mp3'],
    loop: true,
    volume: 0.7,
    html5: true,
    preload: true,
    onload: () => {
      initAudioAnalysis();
      console.warn('🎵 BGM loaded successfully');
    },
    onloaderror: (_, error) => {
      console.error('❌ BGM load error:', error);
    },
  });
};

// === Zustandストア ===
export const useBGMStore = create<BGMStore>()(
  devtools(
    (set, get) => {
      // BGM初期化
      initBGM();

      return {
        // === 初期状態 ===
        isPlaying: false,
        isLoading: false,
        volume: 0.7,
        hasUserConsent: null,
        frequencyData: null,

        // === アクション ===
        requestUserConsent: () => {
          // ユーザーコンセント状態をチェックし、未確認の場合はモーダルを表示
          // 実際の処理はコンポーネント側で実行
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
            return;
          }

          set({ isLoading: true }, false, 'bgm/playStart');

          // オーディオコンテキストの再開
          if (audioContext?.state === 'suspended') {
            audioContext.resume().catch(console.warn);
          }

          howlInstance.play();
          set({ isPlaying: true, isLoading: false }, false, 'bgm/playSuccess');
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
