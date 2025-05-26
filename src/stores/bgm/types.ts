export type BGMPermissionStatus = 'granted' | 'denied' | null;

export type BGMState = {
  // 状態
  permissionStatus: BGMPermissionStatus;
  isPlaying: boolean;
  needsDialogInteraction: boolean;
  isDialogMounted: boolean;
  isDialogAnimatedVisible: boolean;
  sound: Howl | null;
  volume: number;
  isMuted: boolean;
  isInitialized: boolean;
  savedPosition: number;

  // アクション
  handlePermission: (allow: boolean) => void;
  togglePlayback: () => void;
  playAudio: () => void;
  pauseAudio: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
};

export type BGMConfig = {
  readonly PATH: string;
  readonly DEFAULT_VOLUME: number;
  readonly LOAD_DELAY: number;
  readonly AUTOPLAY_DELAY: number;
  readonly DIALOG_CLOSE_DELAY: number;
  readonly DIALOG_SHOW_DELAY: number;
};

export type StorageKeys = {
  readonly PERMISSION: string;
  readonly VOLUME: string;
  readonly MUTE: string;
};
