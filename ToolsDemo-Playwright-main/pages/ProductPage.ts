import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class ProductPage extends BasePage {
  // ── ARIA-first locators ────────────────────────────────────────────────────
  get productNameHeading(): Locator {
    // Product name is in <h1>; related product cards use <h5>.
    // Timing is handled upstream: HomePage.clickProductByIndex waits for the
    // add-to-cart button, so the product h1 is in the DOM before we read it.
    return this.page.getByRole('heading', { level: 1 });
  }
  get unitPriceLabel(): Locator {
    return this.page.getByTestId('unit-price');
  }
  // Number spinner for quantity selection
  get quantityInput(): Locator {
    return this.page.getByRole('spinbutton');
  }
  get addToCartButton(): Locator {
    return this.page.getByRole('button', { name: /add to cart/i });
  }
  // Success toast / alert that appears after adding to cart
  get addToCartConfirmation(): Locator {
    return this.page.getByRole('alert').filter({ hasText: /added to (your )?cart/i })
      .or(this.page.locator('.toast-body, .alert-success').filter({ hasText: /added/i }));
  }
  // Cart badge count in the nav
  get navCartBadge(): Locator {
    return this.page.getByTestId('cart-quantity');
  }

  constructor(page: Page) {
    super(page);
  }

  async getProductName(): Promise<string> {
    return (await this.productNameHeading.textContent()) ?? '';
  }

  async getUnitPriceText(): Promise<string> {
    return (await this.unitPriceLabel.textContent()) ?? '';
  }

  async setQuantity(qty: number): Promise<void> {
    await this.quantityInput.fill(String(qty));
  }

  async addToCart(qty?: number): Promise<void> {
    if (qty !== undefined) {
      await this.setQuantity(qty);
    }

    // The add-to-cart flow always ends with POST /carts/{cartId} → 200 (item-addition call).
    // POST /carts (201) fires first to create/retrieve the cart; POST /carts/{id} follows
    // to add the item. Matching on the URL with a cartId (\w after /carts/) targets the
    // final call specifically so we never return with an empty cart.
    const itemAddedPromise = this.page.waitForResponse(
      r => /\/carts\/\w/.test(r.url()) &&
           r.request().method() === 'POST' &&
           (r.status() === 200 || r.status() === 201),
      { timeout: 15_000 },
    );

    await this.addToCartButton.click();
    await itemAddedPromise;
  }

  async getCartBadgeCount(): Promise<number> {
    await this.navCartBadge.waitFor({ state: 'visible', timeout: 10_000 });
    const text = (await this.navCartBadge.textContent()) ?? '0';
    return parseInt(text.trim(), 10) || 0;
  }
}
