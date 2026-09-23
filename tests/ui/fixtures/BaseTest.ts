import { test as base, BrowserContext, Page } from '@playwright/test';
import { POManager } from '../pages/POManager';

type TestFixtures = {
  context: BrowserContext;
  page: Page;
  poManager: POManager;
};

export const test = base.extend<TestFixtures>({
  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      permissions: ['notifications']
    });
    await use(context);
    await context.close();
  },

  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
    if (!page.isClosed()) {
      await page.close();
    }
  },

  poManager: async ({ page }, use) => {
    await use(new POManager(page));
  }
});

export { expect } from '@playwright/test';
