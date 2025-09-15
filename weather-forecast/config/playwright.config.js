// Playwright configuration for E2E and cross-browser testing
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Test directory
  testDir: './tests',

  // Test patterns
  testMatch: [
    '**/e2e/**/*.test.js',
    '**/cross-browser/**/*.test.js'
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./tests/config/playwright-global-setup.js'),
  globalTeardown: require.resolve('./tests/config/playwright-global-teardown.js'),

  // Test timeout
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000
  },

  // Parallel execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],

  // Global test settings
  use: {
    // Base URL
    baseURL: 'http://localhost:8080',

    // Browser settings
    headless: !!process.env.CI,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Network settings
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9'
    }
  },

  // Browser projects
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    },

    // Tablet
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] }
    },

    // Edge cases
    {
      name: 'Small Mobile',
      use: {
        ...devices['Galaxy S5'],
        viewport: { width: 320, height: 568 }
      }
    },
    {
      name: 'Large Desktop',
      use: {
        viewport: { width: 1920, height: 1080 }
      }
    }
  ],

  // Development server
  webServer: {
    command: 'npm run serve',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test'
    }
  },

  // Output directory
  outputDir: 'test-results',

  // Test artifacts
  preserveOutput: 'failures-only'
});