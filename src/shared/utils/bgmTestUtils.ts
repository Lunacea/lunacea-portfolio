import type { BGMConfig } from '@/shared/types/bgm';

export type MockBGMOptions = {
  duration?: number;
  autoToggle?: boolean;
  toggleInterval?: number;
  simulateErrors?: boolean;
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
      duration: 180,
      autoToggle: false,
      toggleInterval: 10000,
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
        resolve();
      }, 100);
    });
  }

  pause(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isPlaying = false;
        resolve();
      }, 50);
    });
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  getState() {
    return { isPlaying: this.isPlaying, volume: this.volume, isMuted: this.isMuted, duration: this.options.duration };
  }

  destroy(): void {
    if (this.toggleTimer) {
      clearInterval(this.toggleTimer);
    }
  }

  private shouldSimulateError(): boolean {
    return this.options.simulateErrors && Math.random() < this.options.errorProbability;
  }

  private startAutoToggle(): void {
    this.toggleTimer = setInterval(() => {
      this.isPlaying ? this.pause() : this.play();
    }, this.options.toggleInterval);
  }
}

export const createTestBGMConfig = (overrides: Partial<BGMConfig> = {}): BGMConfig => ({
  bgmPath: '/test/mock-bg.mp3',
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
  Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true });
  return {
    cleanup: () => {
      Object.defineProperty(globalThis, 'localStorage', { value: originalLocalStorage, writable: true });
    },
    storage: mockStorage,
  };
};
