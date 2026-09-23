import { test } from '@playwright/test';
import { BrowserManager } from '../../fixtures/BrowserManager';
import { POManager } from '../../pages/POManager';
import { AccountPage } from '../../pages/SkodaParts/AccountPage';
import { NetworkLogger } from '../../../utilities/networkLogger';

test.describe('Skoda Parts authentication tests', () => {
  test.describe.configure({ mode: 'serial', timeout: 120000 });

  let browserManager: BrowserManager;
  let poManager: POManager;
  let accountPage: AccountPage;
  let networkLogger: NetworkLogger;

  test.beforeAll('Open application', async ({ browser }) => {
    browserManager = new BrowserManager(browser);
    const page = await browserManager.openBrowser();

    poManager = new POManager(page);
    browserManager.setPOManager(poManager);
    accountPage = poManager.getAccountPage();
    networkLogger = poManager.getNetworkLogger();
  });

  test.beforeEach('Authentication test setup', async ({}, testInfo) => {
    console.log(`Running ${testInfo.title}`);
    await networkLogger.clear();
  });

  test.afterEach('Flush network logs', async ({}, testInfo) => {
    await networkLogger.flushToAllure(testInfo);
    console.log(`Finished ${testInfo.title}`);
  });

  test('Verify sign-up form and required field validation', async () => {
    await accountPage.verifySignUpFormValidation();
  });

  test('Verify sign-in rejects invalid credentials', async () => {
    await accountPage.verifyInvalidCredentialsAreRejected();
  });

  test('Verify sign-in form displays email and password controls', async () => {
    await accountPage.verifyLoginFormControls();
  });

  test('Verify registered user can sign in', async () => {
    await accountPage.verifyRegisteredUserCanSignIn();
  });

  test.afterAll('Close browser', async () => {
    await browserManager.closeBrowserContext();
  });
});
