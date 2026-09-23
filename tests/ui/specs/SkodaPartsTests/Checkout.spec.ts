import { test } from '@playwright/test';
import { BrowserManager } from '../../fixtures/BrowserManager';
import { POManager } from '../../pages/POManager';
import { ProductDetailsPage } from '../../pages/SkodaParts/ProductDetailsPage';
import { CartPage } from '../../pages/SkodaParts/CartPage';
import { CheckoutPage } from '../../pages/SkodaParts/CheckoutPage';
import { NetworkLogger } from '../../../utilities/networkLogger';

test.describe('Skoda Parts cart and checkout feature tests', () => {
  test.describe.configure({ mode: 'serial', timeout: 120000 });

  let browserManager: BrowserManager;
  let poManager: POManager;
  let productDetailsPage: ProductDetailsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let networkLogger: NetworkLogger;

  test.beforeAll('Open application', async ({ browser }) => {
    browserManager = new BrowserManager(browser);
    const page = await browserManager.openBrowser();

    poManager = new POManager(page);
    browserManager.setPOManager(poManager);
    productDetailsPage = poManager.getProductDetailsPage();
    cartPage = poManager.getCartPage();
    checkoutPage = poManager.getCheckoutPage();
    networkLogger = poManager.getNetworkLogger();
  });

  test.beforeEach('Cart and checkout test setup', async ({}, testInfo) => {
    console.log(`Running ${testInfo.title}`);
    await networkLogger.clear();
  });

  test.afterEach('Flush network logs', async ({}, testInfo) => {
    await networkLogger.flushToAllure(testInfo);
    console.log(`Finished ${testInfo.title}`);
  });

  test('Verify user can open product details from search results', async () => {
    await productDetailsPage.verifyProductCanBeOpenedFromSearch();
  });

  test('Verify user can add a product to cart and review cart', async () => {
    await cartPage.verifyProductCanBeAddedToCart();
  });

  test('Verify checkout starts from cart without placing an order', async () => {
    await checkoutPage.verifyCheckoutStartsWithoutPlacingOrder();
  });

  test.afterAll('Close browser', async () => {
    await browserManager.closeBrowserContext();
  });
});
