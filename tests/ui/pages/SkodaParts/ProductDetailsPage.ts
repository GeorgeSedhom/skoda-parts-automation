import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { JsonDataReader } from '../../../test-data/JsonDataReader';
import { HomePage } from './HomePage';
import { SearchResultsPage } from './SearchResultsPage';

export class ProductDetailsPage extends BasePage {
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.addToCartButton = page
      .getByRole('button', { name: /add.*cart|buy|basket/i })
      .or(page.getByRole('link', { name: /add.*cart|buy|basket/i }))
      .or(page.locator('button[type="submit"], input[type="submit"], a[href*="cart"]'))
      .first();
  }

  async assertProductDetailsVisible(): Promise<void> {
    await this.assertPageLoaded();
    await expect(this.page.locator('h1, h2').first()).toBeVisible();
    await expect(this.page.locator('body')).toContainText(/price|stock|code|part|skoda|eur|czk/i);
  }

  async addToCart(): Promise<void> {
    await this.assertProductDetailsVisible();
    await this.addToCartButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyProductCanBeOpenedFromSearch(): Promise<void> {
    const searchTerm = JsonDataReader.getInstance().getSearchTerm('commonPart');

    await new HomePage(this.page).searchFor(searchTerm);
    await new SearchResultsPage(this.page).openFirstProduct();
    await this.assertProductDetailsVisible();
  }
}
