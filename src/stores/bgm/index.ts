import type { BGMPermissionStatus, BGMState } from './types';
import { Howl } from 'howler';
import { create } from 'zustand';
import { BGM_CONFIG, STORAGE_KEYS } from './config';
import {
  configureHowler,
  createLogger,
  setupAudioContextUnlock,
  storage,
  updateVolume,
} from './utils';

const log = createLogger();

export const useBGMStore = create<BGMState>()((set, get) => {
  // 初期状態
  const initialState = {
    permissionStatus: null as BGMPermissionStatus,
    isPlaying: false,
    needsDialogInteraction: false,
    isDialogMounted: false,
    isDialogAnimatedVisible: false,
    sound: null as Howl | null,
    volume: BGM_CONFIG.DEFAULT_VOLUME,
    isMuted: false,
    isInitialized: false,
    savedPosition: 0,
  };

  // クライアントサイドでの初期化
  if (typeof window !== 'undefined') {
    // 設定を読み込み
    const savedPermission = storage.get(STORAGE_KEYS.PERMISSION, null as BGMPermissionStatus);
    const savedVolume = storage.get(STORAGE_KEYS.VOLUME, BGM_CONFIG.DEFAULT_VOLUME);
    const savedMuted = storage.get(STORAGE_KEYS.MUTE, false);

    log.info('設定を読み込み完了', {
      permission: savedPermission,
      volume: savedVolume,
      muted: savedMuted,
    });

    // 初期状態を更新
    Object.assign(initialState, {
      permissionStatus: savedPermission,
      needsDialogInteraction: savedPermission === null,
      isDialogMounted: savedPermission === null,
      volume: savedVolume,
      isMuted: savedMuted,
    });

    // Howler設定
    configureHowler(savedVolume, savedMuted);

    // Howlインスタンスを作成
    const newSound = new Howl({
      src: [BGM_CONFIG.PATH],
      loop: true,
      volume: savedMuted ? 0 : savedVolume,
      preload: false,
      html5: false,
      onload: () => {
        log.info('BGMファイルの読み込み完了');
        const currentState = get();
        const effectiveVolume = currentState.isMuted ? 0 : currentState.volume;
        newSound.volume(effectiveVolume);

        if (currentState.permissionStatus === 'granted' && !currentState.isPlaying) {
          log.info('許可済みのため自動再生を開始');
          setTimeout(() => get().playAudio(), BGM_CONFIG.AUTOPLAY_DELAY);
        }
      },
      onplay: () => {
        log.info('再生開始');
        set({ isPlaying: true });
      },
      onpause: () => {
        log.info('一時停止');
        set({ isPlaying: false });
      },
      onstop: () => {
        log.info('停止');
        set({ isPlaying: false });
      },
      onloaderror: (_, error) => log.error('BGMファイルの読み込みエラー', error),
      onplayerror: (_, error) => log.error('再生エラー', error),
    });

    initialState.sound = newSound;
    initialState.isInitialized = true;

    // AudioContextアンロック処理
    setupAudioContextUnlock(get);

    // ダイアログアニメーション
    if (savedPermission === null) {
      setTimeout(() => {
        log.debug('ダイアログアニメーション開始');
        set({ isDialogAnimatedVisible: true });
      }, BGM_CONFIG.DIALOG_SHOW_DELAY);
    }

    // 許可済みの場合、音声ファイルのロード開始
    if (savedPermission === 'granted') {
      log.info('許可済みのためBGMファイルを読み込み開始');
      setTimeout(() => {
        if (newSound.state() === 'unloaded') {
          newSound.load();
        }
      }, BGM_CONFIG.LOAD_DELAY);
    }

    log.info('BGMストア初期化完了');
  }

  return {
    ...initialState,

    // 許可処理
    handlePermission: (allow) => {
      const newStatus = allow ? 'granted' : 'denied';
      log.info(`許可設定: ${newStatus}`);

      storage.set(STORAGE_KEYS.PERMISSION, newStatus);
      set({ permissionStatus: newStatus, isDialogAnimatedVisible: false });

      setTimeout(() => {
        set({ isDialogMounted: false, needsDialogInteraction: false });
        log.debug('ダイアログを閉じました');
      }, BGM_CONFIG.DIALOG_CLOSE_DELAY);

      if (allow) {
        get().playAudio();
      } else {
        get().pauseAudio();
      }
    },

    // 再生処理
    playAudio: () => {
      const { sound, permissionStatus, isPlaying, volume, isMuted, savedPosition } = get();

      if (!sound || permissionStatus !== 'granted') {
        log.warn('再生不可: サウンドオブジェクトまたは許可がありません');
        return;
      }

      if (isPlaying) {
        log.debug('既に再生中のため、再生要求をスキップ');
        return;
      }

      const effectiveVolume = isMuted ? 0 : volume;
      const soundState = sound.state();

      log.info('再生開始', {
        state: soundState,
        volume: effectiveVolume,
        savedPosition: savedPosition > 0 ? savedPosition : 'なし',
      });

      // 音量を事前に設定
      sound.volume(effectiveVolume);

      // 状態に応じた再生処理
      const handleLoadedPlayback = (currentState: BGMState) => {
        if (currentState.sound && !currentState.isPlaying && currentState.permissionStatus === 'granted') {
          updateVolume(currentState.sound, currentState.volume, currentState.isMuted);
          const playId = currentState.sound.play();

          // 保存された位置があれば復元
          if (typeof currentState.savedPosition === 'number' && currentState.savedPosition > 0) {
            log.debug('位置復元', currentState.savedPosition);
            currentState.sound.seek(currentState.savedPosition, playId);
            // set({ savedPosition: 0 }); // 位置復元後にリセットするとバグる
          }
        }
      };

      switch (soundState) {
        case 'unloaded':
          log.debug('ファイル未読み込み - 読み込み開始');
          sound.once('load', () => handleLoadedPlayback(get()));
          sound.load();
          break;

        case 'loading':
          log.debug('読み込み中 - 完了を待機');
          sound.once('load', () => handleLoadedPlayback(get()));
          break;

        case 'loaded': {
          const playId = sound.play();

          // 保存された位置があれば復元
          if (typeof savedPosition === 'number' && savedPosition > 0) {
            log.debug('位置復元', savedPosition);
            sound.seek(savedPosition, playId);
            set({ savedPosition: 0 }); // 位置復元後にリセット
          }
          break;
        }

        default:
          log.warn('不明なサウンド状態', soundState);
      }
    },

    // 一時停止処理
    pauseAudio: () => {
      const { sound, isPlaying } = get();

      if (!sound) {
        log.warn('一時停止不可: サウンドオブジェクトがありません');
        return;
      }

      if (!isPlaying) {
        log.debug('既に停止中のため、停止要求をスキップ');
        return;
      }

      const currentPosition = sound.seek();
      log.info('一時停止', { position: currentPosition });

      if (typeof currentPosition === 'number') {
        set({ savedPosition: currentPosition });
        log.debug('位置保存', currentPosition);
      }

      sound.pause();
    },

    // 再生切り替え
    togglePlayback: () => {
      const { isPlaying } = get();
      log.debug('再生切り替え', { currentlyPlaying: isPlaying });

      if (isPlaying) {
        get().pauseAudio();
      } else {
        get().playAudio();
      }
    },

    // 音量設定
    setVolume: (newVolume) => {
      const { sound, isMuted } = get();
      const clampedVolume = Math.max(0, Math.min(1, newVolume));

      storage.set(STORAGE_KEYS.VOLUME, clampedVolume);
      set({ volume: clampedVolume });

      updateVolume(sound, clampedVolume, isMuted);
      log.debug('音量更新', { volume: clampedVolume, effective: isMuted ? 0 : clampedVolume });
    },

    // ミュート切り替え
    toggleMute: () => {
      const { sound, isMuted, volume } = get();
      const newMutedState = !isMuted;

      log.info(`ミュート切り替え: ${newMutedState ? 'ON' : 'OFF'}`);

      storage.set(STORAGE_KEYS.MUTE, newMutedState);
      set({ isMuted: newMutedState });

      updateVolume(sound, volume, newMutedState);
    },
  };
});

// クリーンアップ関数
export const cleanupBGM = () => {
  const state = useBGMStore.getState();
  if (state.sound) {
    log.info('BGMリソースをクリーンアップ');
    state.sound.unload();
    useBGMStore.setState({ sound: null, isPlaying: false });
  }
};

export { BGM_CONFIG, STORAGE_KEYS } from './config';
// 型と設定をエクスポート
export type { BGMPermissionStatus, BGMState } from './types';
