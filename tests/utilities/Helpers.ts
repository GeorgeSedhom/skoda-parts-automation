import { expect, type Locator, type Page } from '@playwright/test';

export async function clickIfVisible(locator: Locator, timeout = 3000): Promise<boolean> {
  const isVisible = await locator.isVisible({ timeout }).catch(() => false);
  if (!isVisible) {
    return false;
  }
  await locator.click();
  return true;
}

export async function acceptCookiesIfPresent(page: Page): Promise<void> {
  await clickIfVisible(
    page
      .getByRole('button', { name: /accept|agree|allow|ok/i })
      .or(page.locator('button[data-cky-tag="accept-button"]'))
      .first(),
    5000
  );
}

export async function expectPageReady(page: Page): Promise<void> {
  await expect(page.locator('body')).toBeVisible();
  await expect(page).not.toHaveTitle(/error|not found/i);
}
