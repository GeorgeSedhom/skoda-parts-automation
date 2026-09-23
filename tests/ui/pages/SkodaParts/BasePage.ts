import { expect, type Locator, type Page } from '@playwright/test';
import { acceptCookiesIfPresent, expectPageReady } from '../../../utilities/Helpers';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async acceptCookiesIfPresent(): Promise<void> {
    await acceptCookiesIfPresent(this.page);
  }

  async assertPageLoaded(): Promise<void> {
    await expectPageReady(this.page);
  }

  protected async firstVisible(candidates: Locator[], timeout = 3000): Promise<Locator> {
    for (const candidate of candidates) {
      if (await candidate.first().isVisible({ timeout }).catch(() => false)) {
        return candidate.first();
      }
    }
    return candidates[0].first();
  }

  protected async expectUrlContains(value: RegExp | string): Promise<void> {
    await expect(this.page).toHaveURL(value);
  }
}
