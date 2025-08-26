import { logger } from '@/shared/libs/Logger';

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
  originalError?: unknown;
  timestamp: Date;
};

export class BGMErrorHandler {
  private static errors: BGMError[] = [];
  private static maxErrors = 50;

  static logError(type: BGMErrorType, message: string, originalError?: unknown): void {
    const error: BGMError = { type, message, originalError, timestamp: new Date() };
    this.errors.unshift(error);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }
    
    // 本番環境ではエラーのみ、開発環境では詳細ログを出力
    if (process.env.NODE_ENV === 'development') {
      logger.warn({ 
        type, 
        message, 
        timestamp: error.timestamp.toISOString(),
        originalError: originalError instanceof Error ? originalError.message : String(originalError)
      }, `BGM Error Details - ${type}`);
    } else {
      logger.error({ type, message }, `[BGM ${type}] ${message}`);
    }
  }

  static getErrors(): BGMError[] {
    return [...this.errors];
  }

  static getErrorsByType(type: BGMErrorType): BGMError[] {
    return this.errors.filter(e => e.type === type);
  }

  static clearErrors(): void {
    this.errors = [];
  }

  static getLatestError(): BGMError | null {
    return this.errors[0] || null;
  }

  static hasRecentErrors(minutes = 5): boolean {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.errors.some(error => error.timestamp > cutoff);
  }
}

export const logBGMError = BGMErrorHandler.logError.bind(BGMErrorHandler);
export const logLoadError = (message: string, error?: unknown) => logBGMError(BGMErrorType.LOAD_ERROR, message, error);
export const logPlayError = (message: string, error?: unknown) => logBGMError(BGMErrorType.PLAY_ERROR, message, error);
export const logAudioContextError = (message: string, error?: unknown) => logBGMError(BGMErrorType.AUDIO_CONTEXT_ERROR, message, error);
export const logPermissionError = (message: string, error?: unknown) => logBGMError(BGMErrorType.PERMISSION_ERROR, message, error);
export const logStorageError = (message: string, error?: unknown) => logBGMError(BGMErrorType.STORAGE_ERROR, message, error);
