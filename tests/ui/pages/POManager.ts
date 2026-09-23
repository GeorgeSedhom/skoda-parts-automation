import { Page } from '@playwright/test';
import { HomePage } from './SkodaParts/HomePage';
import { SearchResultsPage } from './SkodaParts/SearchResultsPage';
import { ProductDetailsPage } from './SkodaParts/ProductDetailsPage';
import { CartPage } from './SkodaParts/CartPage';
import { CheckoutPage } from './SkodaParts/CheckoutPage';
import { AccountPage } from './SkodaParts/AccountPage';
import { NetworkLogger } from '../../utilities/networkLogger';

export class POManager {
  private homePage?: HomePage;
  private searchResultsPage?: SearchResultsPage;
  private productDetailsPage?: ProductDetailsPage;
  private cartPage?: CartPage;
  private checkoutPage?: CheckoutPage;
  private accountPage?: AccountPage;
  private networkLogger?: NetworkLogger;

  constructor(private readonly page: Page) {}

  getHomePage(): HomePage {
    return this.homePage ??= new HomePage(this.page);
  }

  getSearchResultsPage(): SearchResultsPage {
    return this.searchResultsPage ??= new SearchResultsPage(this.page);
  }

  getProductDetailsPage(): ProductDetailsPage {
    return this.productDetailsPage ??= new ProductDetailsPage(this.page);
  }

  getCartPage(): CartPage {
    return this.cartPage ??= new CartPage(this.page);
  }

  getCheckoutPage(): CheckoutPage {
    return this.checkoutPage ??= new CheckoutPage(this.page);
  }

  getAccountPage(): AccountPage {
    return this.accountPage ??= new AccountPage(this.page);
  }

  getNetworkLogger(): NetworkLogger {
    return this.networkLogger ??= new NetworkLogger(this.page);
  }
}
