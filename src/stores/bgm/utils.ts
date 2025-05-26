import type { Howl } from 'howler';
import type { BGMState } from './types';

// デバッグ用ログ関数（開発環境でのみ動作）
export const createLogger = () => {
  const isDev = process.env.NODE_ENV === 'development';

  return {
    info: (message: string, data?: any) => {
      if (isDev) {
        console.warn(`🎵 [BGM] ${message}`, data || '');
      }
    },
    warn: (message: string, data?: any) => {
      if (isDev) {
        console.warn(`⚠️ [BGM] ${message}`, data || '');
      }
    },
    error: (message: string, error?: any) => {
      console.error(`❌ [BGM] ${message}`, error || '');
    },
    debug: (message: string, data?: any) => {
      if (isDev) {
        console.warn(`🔍 [BGM Debug] ${message}`, data || '');
      }
    },
  };
};

// ローカルストレージ操作のヘルパー関数
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      const stored = localStorage.getItem(key);
      if (stored === null) {
        return defaultValue;
      }

      // boolean型の場合
      if (typeof defaultValue === 'boolean') {
        return (stored === 'true') as T;
      }

      // number型の場合
      if (typeof defaultValue === 'number') {
        const parsed = Number.parseFloat(stored);
        return (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) ? parsed as T : defaultValue;
      }

      // string型の場合
      return stored as T;
    } catch (e) {
      createLogger().error(`設定の読み込みに失敗: ${key}`, e);
      return defaultValue;
    }
  },

  set: (key: string, value: any): void => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(key, value.toString());
    } catch (e) {
      createLogger().error(`設定の保存に失敗: ${key}`, e);
    }
  },
};

// Howler設定のヘルパー関数
export const configureHowler = (volume: number, isMuted: boolean) => {
  if (typeof window !== 'undefined' && 'Howler' in window) {
    (window as any).Howler.autoUnlock = true;
    (window as any).Howler.volume = isMuted ? 0 : volume;
  }
};

// AudioContext アンロック処理
export const setupAudioContextUnlock = (getState: () => BGMState) => {
  const log = createLogger();

  const unlockAudioContext = () => {
    if (typeof window !== 'undefined' && 'Howler' in window) {
      const ctx = (window as any).Howler.ctx;
      if (ctx && ctx.state !== 'running') {
        ctx.resume()
          .then(() => {
            log.info('AudioContextをユーザー操作でアンロック');
            const state = getState();
            if (state.permissionStatus === 'granted' && !state.isPlaying) {
              state.playAudio();
            }
          })
          .catch((e: any) => log.error('AudioContextのアンロックに失敗', e));
      }
    }

    // イベントリスナーを削除
    document.removeEventListener('click', unlockAudioContext, true);
    document.removeEventListener('touchstart', unlockAudioContext, true);
  };

  // イベントリスナーを追加
  document.addEventListener('click', unlockAudioContext, { once: true, capture: true });
  document.addEventListener('touchstart', unlockAudioContext, { once: true, capture: true });
};

// 再生処理のヘルパー関数
export const startPlayback = (sound: Howl, savedPosition: number) => {
  const log = createLogger();
  const playId = sound.play();

  // 保存された位置があれば復元
  if (typeof savedPosition === 'number' && savedPosition > 0) {
    log.debug('位置復元', savedPosition);
    sound.seek(savedPosition, playId);
  }

  return playId;
};

// 音量設定のヘルパー関数
export const updateVolume = (sound: Howl | null, volume: number, isMuted: boolean) => {
  if (!sound) {
    return;
  }

  const targetVolume = isMuted ? 0 : volume;
  sound.volume(targetVolume);

  // グローバル設定も更新
  if (typeof window !== 'undefined' && 'Howler' in window) {
    (window as any).Howler.volume = targetVolume;
  }
};
