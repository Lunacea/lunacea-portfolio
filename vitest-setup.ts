import failOnConsole from 'vitest-fail-on-console';
import '@testing-library/jest-dom/vitest';

failOnConsole({
  shouldFailOnDebug: true,
  shouldFailOnError: true,
  shouldFailOnInfo: true,
  shouldFailOnLog: true,
  shouldFailOnWarn: true,
});

// Mock next/navigation for next-intl testing in jsdom
vi.mock('next/navigation', async () => {
  return {
    Router: () => ({ 
      push: () => Promise.resolve(), 
      replace: () => Promise.resolve(), 
      prefetch: () => Promise.resolve(), 
      back: () => Promise.resolve() 
    }),
    Pathname: () => '/',
    SearchParams: () => new URLSearchParams(),
  } as const;
});

// Some builds import the ESM entry explicitly
vi.mock('next/navigation.js', async () => {
  return {
    Router: () => ({ 
      push: () => Promise.resolve(), 
      replace: () => Promise.resolve(), 
      prefetch: () => Promise.resolve(), 
      back: () => Promise.resolve() 
    }),
    Pathname: () => '/',
    SearchParams: () => new URLSearchParams(),
  } as const;
});
