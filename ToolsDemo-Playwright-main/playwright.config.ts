import { defineConfig, devices } from '@playwright/test';
import { config } from './config/config';

export default defineConfig({
  testDir: './tests',

  globalSetup: './config/global-setup.ts',
  globalTeardown: './config/global-teardown.ts',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 4,
  timeout: 90_000,

  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: config.baseURL,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: { mode: 'only-on-failure', fullPage: true },
    video: 'retain-on-failure',
    actionTimeout: config.timeouts.action,
    navigationTimeout: config.timeouts.navigation,
  },

  outputDir: 'test-results/',

  projects: [
    // ── 1. Auth setup: logs in once and saves browser storage state ──────────
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // ── 2. Authenticated tests (most feature tests) ──────────────────────────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: config.authStatePath,
      },
      dependencies: ['setup'],
      testIgnore: ['**/auth.setup.ts', '**/login.spec.ts', '**/negative/**'],
    },

    // ── 3. No-auth tests: login flows ────────────────────────────────────────
    {
      name: 'chromium-noauth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/auth/login.spec.ts'],
    },

    // ── 4. Negative tests: invalid login + checkout edge cases ───────────────
    // Runs unauthenticated; checkout-negative specs sign in via the UI in their
    // own beforeEach. Kept separate so `--project=negative` runs them all at once.
    {
      name: 'negative',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/negative/**'],
      workers: 1,
    },

    // ── 5. Smoke: fast @smoke-tagged run, authenticates once then reuses state ─
    // Depends on `setup` so auth runs once; all smoke tests reuse the saved
    // storageState. Capped at 2 workers (per-project, Playwright 1.61+) for fast
    // parallel execution. Excludes login/negative since those run unauthenticated.
    {
      name: 'smoke',
      use: {
        ...devices['Desktop Chrome'],
        storageState: config.authStatePath,
      },
      dependencies: ['setup'],
      grep: /@smoke/,
      testIgnore: ['**/auth.setup.ts', '**/login.spec.ts', '**/negative/**'],
      workers: 1,
    },
  ],
});
