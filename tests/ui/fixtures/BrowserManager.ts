import { Browser, BrowserContext, Page } from '@playwright/test';
import { POManager } from '../pages/POManager';
import { acceptCookiesIfPresent } from '../../utilities/Helpers';
import EnvSetup from '../../utilities/Setup/EnvSetup';

export class BrowserManager {
  private context!: BrowserContext;
  private page!: Page;
  private poManager!: POManager;

  constructor(private browser: Browser) {}

  async openBrowser(): Promise<Page> {
    this.context = await this.browser.newContext({
      baseURL: EnvSetup.getEnvURL(),
      permissions: ['notifications']
    });
    this.page = await this.context.newPage();
    await acceptCookiesIfPresent(this.page);
    return this.page;
  }

  setPOManager(poManager: POManager): void {
    this.poManager = poManager;
  }

  async closeBrowserContext(): Promise<void> {
    if (this.poManager) {
      await this.poManager.getNetworkLogger().flushPendingRequests();
    }
    if (this.page && !this.page.isClosed()) {
      await this.page.close().catch(() => undefined);
    }
    if (this.context) {
      await this.context.close().catch(() => undefined);
    }
  }
}
