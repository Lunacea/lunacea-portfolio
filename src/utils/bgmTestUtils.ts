import type { BGMConfig } from '@/types/bgm';

export type MockBGMOptions = {
  /** モック音声の長さ（秒） */
  duration?: number;
  /** 自動的に再生状態を変更するか */
  autoToggle?: boolean;
  /** 自動切り替えの間隔（ミリ秒） */
  toggleInterval?: number;
  /** エラーをシミュレートするか */
  simulateErrors?: boolean;
  /** エラー発生確率（0-1） */
  errorProbability?: number;
};

export class MockBGMPlayer {
  private isPlaying = false;
  private volume = 0.3;
  private isMuted = false;
  private options: Required<MockBGMOptions>;
  private toggleTimer?: NodeJS.Timeout;

  constructor(options: MockBGMOptions = {}) {
    this.options = {
      duration: 180, // 3分
      autoToggle: false,
      toggleInterval: 10000, // 10秒
      simulateErrors: false,
      errorProbability: 0.1,
      ...options,
    };

    if (this.options.autoToggle) {
      this.startAutoToggle();
    }
  }

  play(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.shouldSimulateError()) {
        reject(new Error('Mock play error'));
        return;
      }

      setTimeout(() => {
        this.isPlaying = true;
        console.warn('[MockBGM] Play started');
        resolve();
      }, 100);
    });
  }

  pause(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isPlaying = false;
        console.warn('[MockBGM] Play paused');
        resolve();
      }, 50);
    });
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    console.warn('[MockBGM] Volume set to:', this.volume);
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    console.warn('[MockBGM] Muted set to:', this.isMuted);
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      volume: this.volume,
      isMuted: this.isMuted,
      duration: this.options.duration,
    };
  }

  destroy(): void {
    if (this.toggleTimer) {
      clearInterval(this.toggleTimer);
    }
    console.warn('[MockBGM] Destroyed');
  }

  private shouldSimulateError(): boolean {
    return this.options.simulateErrors && Math.random() < this.options.errorProbability;
  }

  private startAutoToggle(): void {
    this.toggleTimer = setInterval(() => {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    }, this.options.toggleInterval);
  }
}

export const createTestBGMConfig = (overrides: Partial<BGMConfig> = {}): BGMConfig => ({
  bgmPath: '/test/mock-bgm.mp3',
  defaultVolume: 0.5,
  fadeTime: 500,
  autoPlay: false,
  loop: true,
  preload: true,
  html5: true,
  ...overrides,
});

export const mockLocalStorage = () => {
  const storage: Record<string, string> = {};

  return {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach(key => delete storage[key]);
    },
    get length() {
      return Object.keys(storage).length;
    },
    key: (index: number) => Object.keys(storage)[index] || null,
  };
};

export const createBGMTestEnvironment = () => {
  const originalLocalStorage = globalThis.localStorage;
  const mockStorage = mockLocalStorage();

  // localStorageをモックに置き換え
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    writable: true,
  });

  return {
    cleanup: () => {
      Object.defineProperty(globalThis, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    },
    storage: mockStorage,
  };
};
