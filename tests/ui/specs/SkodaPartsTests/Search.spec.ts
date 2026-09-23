import { test } from '@playwright/test';
import { BrowserManager } from '../../fixtures/BrowserManager';
import { POManager } from '../../pages/POManager';
import { HomePage } from '../../pages/SkodaParts/HomePage';
import { SearchResultsPage } from '../../pages/SkodaParts/SearchResultsPage';
import { NetworkLogger } from '../../../utilities/networkLogger';

test.describe('Skoda Parts search feature tests', () => {
  test.describe.configure({ mode: 'serial', timeout: 120000 });

  let browserManager: BrowserManager;
  let poManager: POManager;
  let homePage: HomePage;
  let searchResultsPage: SearchResultsPage;
  let networkLogger: NetworkLogger;

  test.beforeAll('Open application', async ({ browser }) => {
    browserManager = new BrowserManager(browser);
    const page = await browserManager.openBrowser();

    poManager = new POManager(page);
    browserManager.setPOManager(poManager);
    homePage = poManager.getHomePage();
    searchResultsPage = poManager.getSearchResultsPage();
    networkLogger = poManager.getNetworkLogger();
  });

  test.beforeEach('Search test setup', async ({}, testInfo) => {
    console.log(`Running ${testInfo.title}`);
    await networkLogger.clear();
  });

  test.afterEach('Flush network logs', async ({}, testInfo) => {
    await networkLogger.flushToAllure(testInfo);
    console.log(`Finished ${testInfo.title}`);
  });

  test('Verify homepage loads core spare-part navigation', async () => {
    await homePage.verifyHomepageLoadsCoreNavigation();
  });

  test('Verify user can search for a common part', async () => {
    await searchResultsPage.verifyCommonPartSearch();
  });

  test('Verify model category navigation opens relevant catalogue', async () => {
    await homePage.verifyModelCategoryNavigation();
  });

  test('Verify no-result search is handled without application error', async () => {
    await searchResultsPage.verifyNoResultSearchIsHandled();
  });

  test.afterAll('Close browser', async () => {
    await browserManager.closeBrowserContext();
  });
});
