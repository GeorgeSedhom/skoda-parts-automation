import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { JsonDataReader } from '../../../test-data/JsonDataReader';
import { HomePage } from './HomePage';

export class SearchResultsPage extends BasePage {
  readonly productLinks: Locator;
  readonly addToCartButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.productLinks = page.locator(
      'a[href*="product"], a[href*="spare-part"], a[href*="item"], .product a, .products a'
    );
    this.addToCartButtons = page
      .getByRole('button', { name: /add.*cart|buy|basket/i })
      .or(page.getByRole('link', { name: /add.*cart|buy|basket/i }))
      .or(page.locator('a[href*="cart"], button[name*="cart" i], input[value*="cart" i]'));
  }

  async assertSearchResultsFor(term: string): Promise<void> {
    await this.assertPageLoaded();
    await expect(this.page.locator('body')).toContainText(new RegExp(term.split(' ')[0], 'i'));
    await expect(
      this.page.getByRole('heading', { name: new RegExp(term, 'i') })
        .or(this.page.getByText(/showing items/i))
        .first()
    ).toBeVisible();
    await expect(
      this.page.getByRole('link', { name: /show products/i })
        .or(this.page.getByRole('button', { name: /show products/i }))
        .first()
    ).toBeVisible();
  }

  async assertNoResultState(): Promise<void> {
    await this.assertPageLoaded();
    await expect(this.page.locator('body')).toContainText(/no products|not found|nothing|0 items|search/i);
  }

  async verifyCommonPartSearch(): Promise<void> {
    const searchTerm = JsonDataReader.getInstance().getSearchTerm('commonPart');

    await new HomePage(this.page).searchFor(searchTerm);
    await this.assertSearchResultsFor(searchTerm);
  }

  async verifyNoResultSearchIsHandled(): Promise<void> {
    const searchTerm = JsonDataReader.getInstance().getSearchTerm('noResult');

    await new HomePage(this.page).searchFor(searchTerm);
    await expect(this.page.locator('body')).toBeVisible();
    await expect(this.page).not.toHaveTitle(/error|exception/i);
  }

  async openFirstProduct(): Promise<void> {
    const candidate = await this.firstVisible([
      this.productLinks,
      this.page.locator('main a[href]').filter({ hasText: /.+/ })
    ], 5000);
    await candidate.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async addFirstVisibleProductToCart(): Promise<void> {
    const addToCart = await this.firstVisible([this.addToCartButtons], 5000);
    await addToCart.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
