import { defineConfig, devices } from '@playwright/test';

// Use process.env.PORT by default and fallback to port 3000
const PORT = process.env.PORT || 3000;

// Set webServer.url and use.baseURL with the location of the WebServer respecting the correct set port
const baseURL = `http://localhost:${PORT}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  // Look for files with the .spec.js or .e2e.js extension
  testMatch: '*.@(spec|e2e).?(c|m)[jt]s?(x)',
  // Timeout per test (CI環境では短縮)
  timeout: process.env.CI ? 20 * 1000 : 30 * 1000,
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: process.env.CI ? 'github' : 'list',
  // CI環境では並列実行数を最適化
  workers: process.env.CI ? 2 : undefined,

  expect: {
    // Set timeout for async expect matchers (CI環境では短縮)
    timeout: process.env.CI ? 5 * 1000 : 10 * 1000,
  },

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: {
    command: process.env.CI ? 'bun run dev' : 'bun run dev:next',
    url: baseURL,
    timeout: process.env.CI ? 90 * 1000 : 2 * 60 * 1000, // CI環境では90秒に短縮
    reuseExistingServer: !process.env.CI,
    // テスト用の環境変数を設定
    env: {
      NODE_ENV: 'test',
      ARCJET_ENV: 'development',
      NEXT_PUBLIC_ENABLE_BGM: 'true',
      NEXT_PUBLIC_BGM_AUTOPLAY: 'false',
      NEXT_PUBLIC_BGM_VOLUME: '0.5',
      NEXT_PUBLIC_DISABLE_BGM_MODAL: 'true',
    },
  },

  // Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions.
  use: {
    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL,

    // Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
    trace: 'retain-on-failure',

    // Record videos when retrying the failed test.
    video: process.env.CI ? 'retain-on-failure' : undefined,

    // Add user-agent header to avoid Arcjet BOT detection errors
    extraHTTPHeaders: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // CI環境ではEdgeテストを追加（Windows環境でのみ）
    ...(process.env.CI && process.env.RUNNER_OS === 'Windows'
      ? [
          {
            name: 'msedge',
            use: { ...devices['Desktop Edge'] },
          },
        ]
      : []),
  ],
});
