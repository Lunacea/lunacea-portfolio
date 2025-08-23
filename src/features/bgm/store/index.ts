import { Howl } from 'howler';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
let dataArray: Uint8Array | null = null;

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
      onloaderror: (error) => {
        console.warn('BGM読み込みエラー:', error);
      },
      onplayerror: (error) => {
        console.warn('BGM再生エラー:', error);
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
          (window as any).bgmStore = useBGMStore;
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
                console.warn('BGM初期化に失敗しました');
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
              audioContext.resume().catch((error) => {
                console.warn('AudioContextの再開に失敗:', error);
              });
            }
            const soundId = howlInstance.play();
            set({ isPlaying: true, isLoading: false, isInitialized: true, currentSoundId: soundId ?? null }, false, 'bgm/playSuccess');
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
            const { currentSoundId } = get();
            if (currentSoundId != null) {
              howlInstance.pause(currentSoundId);
            } else {
              howlInstance.pause();
            }
            set({ isPlaying: false, currentSoundId: null }, false, 'bgm/pause');
          } catch (error) {
            console.warn('BGM停止エラー:', error);
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
