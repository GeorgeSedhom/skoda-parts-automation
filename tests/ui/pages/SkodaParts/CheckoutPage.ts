import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { JsonDataReader } from '../../../test-data/JsonDataReader';
import { HomePage } from './HomePage';
import { SearchResultsPage } from './SearchResultsPage';
import { ProductDetailsPage } from './ProductDetailsPage';
import { CartPage } from './CartPage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertCheckoutStepVisible(): Promise<void> {
    await this.assertPageLoaded();
    await expect(this.page.locator('body')).toContainText(/checkout|delivery|shipping|payment|customer|order/i);
  }

  async fillCustomerEmail(email: string): Promise<void> {
    const emailField = this.page.locator('input[type="email"], input[name*="email" i]').first();
    if (await emailField.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailField.fill(email);
    }
  }

  async verifyCheckoutStartsWithoutPlacingOrder(): Promise<void> {
    const jsonReader = JsonDataReader.getInstance();
    const searchTerm = jsonReader.getSearchTerm('commonPart');
    const customer = jsonReader.getCheckoutCustomer();

    await new HomePage(this.page).searchFor(searchTerm);
    await new SearchResultsPage(this.page).openFirstProduct();
    await new ProductDetailsPage(this.page).addToCart();
    await new CartPage(this.page).proceedToCheckout();
    await this.assertCheckoutStepVisible();
    await this.fillCustomerEmail(customer.email);
  }
}
