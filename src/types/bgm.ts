export type BGMPermissionStatus = 'granted' | 'denied' | null;

export type BGMConfig = {
  /** BGMファイルのパス */
  bgmPath: string;
  /** デフォルト音量 (0-1) */
  defaultVolume: number;
  /** フェードイン/アウト時間 (ms) */
  fadeTime: number;
  /** 自動再生を有効にするか */
  autoPlay: boolean;
  /** ループ再生を有効にするか */
  loop: boolean;
  /** プリロードを有効にするか */
  preload: boolean;
  /** HTML5オーディオを使用するか */
  html5: boolean;
};

export type BGMState = {
  permissionStatus: BGMPermissionStatus;
  isPlaying: boolean;
  needsDialogInteraction: boolean;
  isDialogMounted: boolean;
  isDialogAnimatedVisible: boolean;
  sound: any; // Howl型
  volume: number;
  isMuted: boolean;
  isInitialized: boolean;
};

export type BGMActions = {
  handlePermission: (allow: boolean) => void;
  togglePlayback: () => void;
  playAudio: () => void;
  pauseAudio: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
};

export type BGMControlsHookReturn = {
  // 状態
  permissionStatus: BGMPermissionStatus;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  shouldShowDialog: boolean;
  shouldShowControls: boolean;
  isDialogAnimatedVisible: boolean;

  // アクション
  handlePermission: (allow: boolean) => void;
  handleTogglePlayback: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  handleVolumeChange: (values: number[]) => void;
  handleMuteToggle: (event?: React.MouseEvent<HTMLButtonElement>) => void;
};

export type BGMStorageKeys = {
  permission: string;
  volume: string;
  mute: string;
};

export const DEFAULT_BGM_CONFIG: BGMConfig = {
  bgmPath: '/assets/sound/bgm.mp3',
  defaultVolume: 0.3,
  fadeTime: 1000,
  autoPlay: true,
  loop: true,
  preload: false,
  html5: false,
};

export const BGM_STORAGE_KEYS: BGMStorageKeys = {
  permission: 'bgm-permission',
  volume: 'bgm-volume',
  mute: 'bgm-muted',
};
