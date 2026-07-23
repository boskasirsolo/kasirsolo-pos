import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Disable webServer for now - start apps manually with: npm run dev
  // Or update below if apps support parallel startup
  webServer: [
    // {
    //   command: 'npm run dev',
    //   url: 'http://localhost:3003',
    //   reuseExistingServer: !process.env.CI,
    //   timeout: 120 * 1000,
    // },
    // {
    //   command: 'npm run dev',
    //   url: 'http://localhost:3010',
    //   reuseExistingServer: !process.env.CI,
    //   timeout: 120 * 1000,
    //   env: {
    //     PORT: '3010',
    //   },
    // },
  ],
});
