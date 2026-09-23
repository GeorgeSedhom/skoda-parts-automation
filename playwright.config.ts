import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import { resolveEnvironmentUrls } from './tests/utilities/URLs/environmentBaseUrl.resolver';
import { resolvePlaywrightOutputDir } from './configs/playwright-output-dir';

dotenv.config({ override: false });

export default defineConfig({
  timeout: 60 * 1000,
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  maxFailures: 0,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: resolveEnvironmentUrls(process.env.ENV).UI,
    viewport: { width: 1550, height: 750 },
    headless: process.env.HEADLESS !== 'false',
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    acceptDownloads: true,
    actionTimeout: 15 * 1000,
    navigationTimeout: 45 * 1000
  },
  outputDir: resolvePlaywrightOutputDir(),
  projects: [
    {
      name: 'ui-tests',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: [
            '--start-maximized',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ]
        }
      }
    },
    {
      name: 'Edge',
      use: {
        browserName: 'chromium',
        channel: 'msedge',
        launchOptions: {
          args: [
            '--start-maximized',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
          ]
        }
      }
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox'
      }
    }
  ]
});
