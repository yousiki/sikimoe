import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const LOCAL_URL = `http://localhost:${PORT}`;

/**
 * Playwright is kept for screenshots only — `bun run shots` captures the pages
 * for design review, and `scripts/generate-assets.ts` renders the social card.
 * Nothing here asserts anything; there is no behavioural suite to run.
 *
 * Point it at a deployment instead of the local build:
 *
 *   PLAYWRIGHT_BASE_URL=https://siki-moe-preview.pages.dev bun run shots
 *
 * The local static server is skipped when an external target is given.
 */
const EXTERNAL_URL = process.env['PLAYWRIGHT_BASE_URL'];
const BASE_URL = EXTERNAL_URL ?? LOCAL_URL;

export default defineConfig({
  testDir: './tests/visual',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  // Left unset off CI so Playwright picks a worker count from the machine.
  ...(process.env['CI'] ? { workers: 2 } : {}),
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 30_000,
  expect: { timeout: 7_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      // Screenshot capture for design review — run with `bun run shots`.
      name: 'visual',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /visual\.spec\.ts/,
    },
  ],

  // Serve the real production build so the screenshots match what ships.
  ...(EXTERNAL_URL
    ? {}
    : {
        webServer: {
          command: `bun run scripts/serve.ts ${PORT}`,
          url: LOCAL_URL,
          reuseExistingServer: !process.env['CI'],
          timeout: 120_000,
          stdout: 'ignore' as const,
          stderr: 'pipe' as const,
        },
      }),
});
