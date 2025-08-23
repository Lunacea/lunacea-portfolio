export enum BGMErrorType {
  LOAD_ERROR = 'LOAD_ERROR',
  PLAY_ERROR = 'PLAY_ERROR',
  AUDIO_CONTEXT_ERROR = 'AUDIO_CONTEXT_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
}

export type BGMConfig = {
  bgmPath: string;
  defaultVolume: number;
  fadeTime: number;
  autoPlay: boolean;
  loop: boolean;
  preload: boolean;
  html5: boolean;
};
