import type { BGMConfig, StorageKeys } from './types';

export const STORAGE_KEYS: StorageKeys = {
  PERMISSION: 'bgm-permission',
  VOLUME: 'bgm-volume',
  MUTE: 'bgm-muted',
} as const;

export const BGM_CONFIG: BGMConfig = {
  PATH: '/assets/sound/bgm.mp3',
  DEFAULT_VOLUME: 0.3,
  LOAD_DELAY: 200,
  AUTOPLAY_DELAY: 100,
  DIALOG_CLOSE_DELAY: 300,
  DIALOG_SHOW_DELAY: 100,
} as const;
