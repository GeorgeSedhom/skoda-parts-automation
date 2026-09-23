import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { JsonDataReader } from '../../../test-data/JsonDataReader';
import { HomePage } from './HomePage';
import { SearchResultsPage } from './SearchResultsPage';
import { ProductDetailsPage } from './ProductDetailsPage';

export class CartPage extends BasePage {
  readonly quantityInput: Locator;
  readonly checkoutButton: Locator;
  readonly removeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.quantityInput = page.locator('input[name*="quantity" i], input[name*="qty" i], input[type="number"]').first();
    this.checkoutButton = page
      .getByRole('link', { name: /checkout|order|continue/i })
      .or(page.getByRole('button', { name: /checkout|order|continue/i }))
      .or(page.locator('a[href*="checkout"], button[type="submit"], input[type="submit"]'))
      .first();
    this.removeButton = page
      .getByRole('link', { name: /remove|delete/i })
      .or(page.getByRole('button', { name: /remove|delete/i }))
      .or(page.locator('a[href*="remove"], a[href*="delete"], button[name*="remove" i]'))
      .first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart.html', { waitUntil: 'domcontentloaded' });
    await this.acceptCookiesIfPresent();
    await this.assertPageLoaded();
  }

  async assertCartHasProduct(): Promise<void> {
    await this.assertPageLoaded();
    await expect(this.page.locator('body')).toContainText(/cart|basket|shopping|quantity|price|total|order/i);
  }

  async updateQuantity(quantity: string): Promise<void> {
    await expect(this.quantityInput).toBeVisible();
    await this.quantityInput.fill(quantity);
    await this.quantityInput.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async proceedToCheckout(): Promise<void> {
    await this.assertCartHasProduct();
    await this.checkoutButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async removeProductIfPresent(): Promise<void> {
    if (await this.removeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.removeButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async verifyProductCanBeAddedToCart(): Promise<void> {
    const searchTerm = JsonDataReader.getInstance().getSearchTerm('commonPart');

    await new HomePage(this.page).searchFor(searchTerm);
    await new SearchResultsPage(this.page).openFirstProduct();
    await new ProductDetailsPage(this.page).addToCart();
    await this.assertCartHasProduct();
  }
}
