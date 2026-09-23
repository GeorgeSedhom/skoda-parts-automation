import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly modelSelect: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page
      .locator('#LBautocomplete, input[name="term"], input[type="search"], input[name*="search" i]')
      .first();
    this.searchButton = page
      .getByRole('button', { name: /search|find|go/i })
      .or(page.locator('button[type="submit"], input[type="submit"]'))
      .first();
    this.modelSelect = page.locator('#top-select-model');
    this.cartLink = page
      .getByRole('link', { name: /cart|basket|shopping/i })
      .or(page.locator('a[href*="cart"], a[href*="basket"]'))
      .first();
  }

  async goto(): Promise<void> {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await this.page.goto('/online-store.html', { waitUntil: 'domcontentloaded' });
      await this.acceptCookiesIfPresent();

      const storeIsReady = await this.searchInput
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (storeIsReady) {
        await this.assertPageLoaded();
        return;
      }

      if (attempt < 3) {
        await this.page.waitForTimeout(1000);
      }
    }

    await expect(this.searchInput, 'Online store did not load after three attempts').toBeVisible();
  }

  async assertHomepageContent(): Promise<void> {
    await expect(this.page.getByText(/skoda spare parts by model/i).or(this.page.getByText(/spare parts/i)).first()).toBeVisible();
    await expect(this.page.getByRole('link', { name: /octavia/i }).first()).toBeVisible();
    await expect(this.page.getByRole('link', { name: /fabia/i }).first()).toBeVisible();
  }

  async verifyHomepageLoadsCoreNavigation(): Promise<void> {
    await this.goto();
    await this.assertHomepageContent();
  }

  async searchFor(term: string): Promise<void> {
    await this.goto();
    const searchBox = await this.firstVisible([
      this.searchInput
    ]);
    await searchBox.fill(term);
    await searchBox.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async openModel(modelName: string): Promise<void> {
    await this.goto();
    await this.modelSelect.selectOption({ label: modelName });
    await this.searchButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyModelCategoryNavigation(modelName = 'Octavia'): Promise<void> {
    await this.openModel(modelName);
    await expect(this.page.locator('body')).toContainText(
      new RegExp(`${modelName}|spare parts|products|model`, 'i')
    );
  }
}
