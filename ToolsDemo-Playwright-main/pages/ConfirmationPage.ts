import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class ConfirmationPage extends BasePage {
  // ── ARIA-first locators ────────────────────────────────────────────────────
  get successHeading(): Locator {
    return this.page.getByRole('heading', { name: /payment was successful|order confirmed|thank you/i });
  }
  // The order confirmation message / number paragraph
  get orderConfirmationText(): Locator {
    return this.page.getByText(/order number|your order/i);
  }
  get successAlert(): Locator {
    return this.page.getByRole('alert').filter({ hasText: /success|confirmed|thank you/i })
      .or(this.page.locator('.alert-success, .alert.success'));
  }

  constructor(page: Page) {
    super(page);
  }

  async isOrderConfirmed(): Promise<boolean> {
    try {
      await this.successHeading
        .or(this.orderConfirmationText)
        .or(this.successAlert)
        .waitFor({ state: 'visible', timeout: 15_000 });
      return true;
    } catch {
      return false;
    }
  }

  async getConfirmationText(): Promise<string> {
    const combined = this.successHeading
      .or(this.orderConfirmationText)
      .or(this.successAlert);
    try {
      await combined.first().waitFor({ state: 'visible', timeout: 5_000 });
      return (await combined.first().textContent()) ?? '';
    } catch {
      return '';
    }
  }
}
