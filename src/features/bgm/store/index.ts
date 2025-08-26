import { Howl } from 'howler';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 型定義の追加
interface ExtendedWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
  bgmStore?: ReturnType<typeof useBGMStore>;
}

interface ExtendedWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
  bgmStore?: ReturnType<typeof useBGMStore>;
}

interface ExtendedHowl extends Howl {
  _sounds?: Array<{
    _node?: HTMLAudioElement;
  }>;
}

type BGMState = {
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  hasUserConsent: boolean | null;
  isInitialized: boolean;
  frequencyData: Uint8Array | null;
  currentSoundId: number | null;
};

type BGMActions = {
  requestUserConsent: () => void;
  grantConsent: () => void;
  denyConsent: () => void;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  updateFrequencyData: () => void;
};

type BGMStore = BGMState & BGMActions;

let howlInstance: Howl | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array<ArrayBuffer> | null = null;

const initAudioAnalysis = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const extendedWindow = window as ExtendedWindow;
    audioContext = new (window.AudioContext || extendedWindow.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.8;
    const extendedHowl = howlInstance as ExtendedHowl;
    const audioElement = extendedHowl._sounds?.[0]?._node;
    if (audioElement?.tagName === 'AUDIO') {
      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      // The constructor creates a Uint8Array backed by an ArrayBuffer in JS runtime.
      // TS 5.9 generics infer ArrayBufferLike; assert the concrete ArrayBuffer variant here.
      dataArray = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
    }
  } catch {
    // ignore
  }
};

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
      onend: () => {
        // ループ時の二重再生ガード: Howlerのloop=trueで再生継続するが、状態は維持する
        // ここでは特に追い再生しない
      },
      onloaderror: () => {
        // BGM読み込みエラー
      },
      onplayerror: () => {
        // BGM再生エラー
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            const extendedWindow = window as ExtendedWindow;
            if (extendedWindow.bgmStore) {
              const store = extendedWindow.bgmStore;
              // 型安全なチェック
              if (store && typeof store === 'object' && 'getState' in store && typeof store.getState === 'function') {
                const state = store.getState();
                if (state && typeof state === 'object' && 'pause' in state && typeof state.pause === 'function') {
                  state.pause();
                }
              }
            }
          }
        }, 0);
      },
    });
  } catch {
    // Howlインスタンス作成失敗
    howlInstance = null;
  }
};

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

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanup);
}

export const useBGMStore = create<BGMStore>()(
  devtools(
    (set, get) => {
      let initialUserConsent: boolean | null = null;
      if (typeof window !== 'undefined') {
        try {
          const persisted = localStorage.getItem('bgmUserConsent');
          if (persisted === 'granted') {
            initialUserConsent = true;
          } else if (persisted === 'denied') {
            initialUserConsent = false;
          } else {
            initialUserConsent = null;
          }
        } catch {
          initialUserConsent = null;
        }
        setTimeout(() => {
          if (initialUserConsent === true) {
            initBGM();
          }
          const extendedWindow = window as ExtendedWindow;
          extendedWindow.bgmStore = useBGMStore;
        }, 100);
      }

      return {
        isPlaying: false,
        isLoading: false,
        volume: 0.7,
        hasUserConsent: initialUserConsent,
        isInitialized: false,
        frequencyData: null,
        currentSoundId: null,
        requestUserConsent: () => {
          set({ hasUserConsent: null }, false, 'bgm/requestUserConsent');
        },
        grantConsent: () => {
          try {
            localStorage.setItem('bgmUserConsent', 'granted');
          } catch {
            // ignore
          }
          set({ hasUserConsent: true }, false, 'bgm/grantConsent');
          // 単一インスタンス再生を保証
          const state = get();
          if (!state.isPlaying) {
            state.play();
          }
        },
        denyConsent: () => {
          try {
            localStorage.setItem('bgmUserConsent', 'denied');
          } catch {
            // ignore
          }
          set({ hasUserConsent: false }, false, 'bgm/denyConsent');
        },
        play: () => {
          if (!howlInstance) {
            set({ isInitialized: false }, false, 'bgm/initializationStart');
            initBGM();
            setTimeout(() => {
                              if (!howlInstance) {
                  // BGM初期化に失敗しました
                  set({ isLoading: false, isInitialized: false }, false, 'bgm/playError');
                } else {
                set({ isInitialized: true }, false, 'bgm/initializationSuccess');
                const st = get();
                if (!st.isPlaying) {
                  st.play();
                }
              }
            }, 200);
            return;
          }
          // 既に再生中なら二重再生を避ける
          const { isPlaying } = get();
          if (isPlaying) {
            return;
          }
          set({ isLoading: true }, false, 'bgm/playStart');
          try {
            if (audioContext?.state === 'suspended') {
              audioContext.resume().catch(() => {
                // AudioContextの再開に失敗
              });
            }
            const soundId = howlInstance.play();
            set({ isPlaying: true, isLoading: false, isInitialized: true, currentSoundId: soundId ?? null }, false, 'bgm/playSuccess');
          } catch {
            // BGM再生エラー
            set({ isPlaying: false, isLoading: false }, false, 'bgm/playError');
          }
        },
        pause: () => {
          if (!howlInstance) {
            // BGM停止: インスタンスが存在しません
            return;
          }
          try {
            const { currentSoundId } = get();
            if (currentSoundId != null) {
              howlInstance.pause(currentSoundId);
            } else {
              howlInstance.pause();
            }
            set({ isPlaying: false, currentSoundId: null }, false, 'bgm/pause');
          } catch {
            // BGM停止エラー
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
    { name: 'bgm-store' },
  ),
);

export const selectIsPlaying = (state: BGMStore) => state.isPlaying;
export const selectVolume = (state: BGMStore) => state.volume;
export const selectHasUserConsent = (state: BGMStore) => state.hasUserConsent;
export const selectFrequencyData = (state: BGMStore) => state.frequencyData;
export const selectIsLoading = (state: BGMStore) => state.isLoading;
export const selectIsInitialized = (state: BGMStore) => state.isInitialized;
