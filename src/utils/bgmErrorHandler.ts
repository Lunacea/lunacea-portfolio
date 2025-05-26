export enum BGMErrorType {
  LOAD_ERROR = 'LOAD_ERROR',
  PLAY_ERROR = 'PLAY_ERROR',
  AUDIO_CONTEXT_ERROR = 'AUDIO_CONTEXT_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
}

export type BGMError = {
  type: BGMErrorType;
  message: string;
  originalError?: any;
  timestamp: Date;
};

export class BGMErrorHandler {
  private static errors: BGMError[] = [];
  private static maxErrors = 50;

  static logError(type: BGMErrorType, message: string, originalError?: any): void {
    const error: BGMError = {
      type,
      message,
      originalError,
      timestamp: new Date(),
    };

    this.errors.unshift(error);

    // エラー履歴の上限を維持
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // コンソールにログ出力
    console.error(`[BGM ${type}] ${message}`, originalError);

    // 開発環境では詳細なエラー情報を表示
    if (process.env.NODE_ENV === 'development') {
      console.warn(`BGM Error Details - ${type}`);
      console.warn('Message:', message);
      console.warn('Timestamp:', error.timestamp.toISOString());
      if (originalError) {
        console.warn('Original Error:', originalError);
      }
    }
  }

  static getErrors(): BGMError[] {
    return [...this.errors];
  }

  static getErrorsByType(type: BGMErrorType): BGMError[] {
    return this.errors.filter(error => error.type === type);
  }

  static clearErrors(): void {
    this.errors = [];
  }

  static getLatestError(): BGMError | null {
    return this.errors[0] || null;
  }

  static hasRecentErrors(minutes: number = 5): boolean {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.errors.some(error => error.timestamp > cutoff);
  }
}

// 便利な関数
export const logBGMError = BGMErrorHandler.logError.bind(BGMErrorHandler);

// よく使用されるエラーログ関数
export const logLoadError = (message: string, error?: any) =>
  logBGMError(BGMErrorType.LOAD_ERROR, message, error);

export const logPlayError = (message: string, error?: any) =>
  logBGMError(BGMErrorType.PLAY_ERROR, message, error);

export const logAudioContextError = (message: string, error?: any) =>
  logBGMError(BGMErrorType.AUDIO_CONTEXT_ERROR, message, error);

export const logPermissionError = (message: string, error?: any) =>
  logBGMError(BGMErrorType.PERMISSION_ERROR, message, error);

export const logStorageError = (message: string, error?: any) =>
  logBGMError(BGMErrorType.STORAGE_ERROR, message, error);
