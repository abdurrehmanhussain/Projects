import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { parseCurrency } from '../utils/price-utils';

export interface CartRowData {
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export class CartPage extends BasePage {
  // ── Locators ───────────────────────────────────────────────────────────────
  // Cart item rows — each row has exactly one quantity spinbutton.
  // getByRole('row') matches <tr> and elements with role="row" (table or ARIA grid).
  get cartItemRows(): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('spinbutton'),
    });
  }
  // Cart total displayed at the bottom of the cart
  get cartTotalLabel(): Locator {
    return this.page.getByTestId('cart-total');
  }
  // "Proceed" button at the end of the cart step — Toolshop labels it "Proceed" or
  // "Proceed to checkout"; use a broad regex and add data-test fallback.
  get proceedToCheckoutButton(): Locator {
    return this.page.getByRole('button', { name: /proceed/i })
      .or(this.page.getByRole('link', { name: /proceed/i }))
      .or(this.page.getByTestId('proceed-1'));
  }
  // Empty-cart message
  get emptyCartMessage(): Locator {
    return this.page.getByText(/cart is empty|no items/i);
  }

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    // Toolshop uses Angular path routing (not hash routing) — the checkout URL is /checkout.
    // Angular route guards allow access when the cart is non-empty and the user is authenticated.
    await this.page.goto('/checkout', { waitUntil: 'networkidle' });
  }

  async getCartItemCount(): Promise<number> {
    return this.cartItemRows.count();
  }

  // ── Per-row helpers ────────────────────────────────────────────────────────

  private rowQtyInput(row: Locator): Locator {
    return row.getByRole('spinbutton');
  }

  private rowDeleteButton(row: Locator): Locator {
    // Toolshop uses a trash-icon button; ARIA name may vary — try several
    return row
      .getByRole('button', { name: /delete|remove/i })
      .or(row.locator('.btn-danger, [aria-label*="delete" i], [aria-label*="remove" i]'))
      .first();
  }

  async setQuantityForRow(rowIndex: number, qty: number): Promise<void> {
    const row = this.cartItemRows.nth(rowIndex);
    const input = this.rowQtyInput(row);
    const prevTotal = await this.cartTotalLabel.textContent({ timeout: 5_000 }).catch(() => null);
    // Register before fill so we don't miss a debounced API call that fires on input.
    // Best-effort: edge-case quantities (negative) may be clamped client-side with no API
    // call, so we don't fail if the response never arrives.
    const updatePromise = this.page.waitForResponse(
      r => r.url().includes('/carts') &&
           r.request().method() !== 'GET' &&
           r.status() < 400,
      { timeout: 15_000 },
    ).catch(() => null);
    await input.fill(String(qty));
    await input.press('Tab');
    await updatePromise;
    // API has responded — wait for Angular to re-render the updated cart total.
    // Best-effort: edge-case quantities (0, negative) may be rejected by the app so the
    // total never changes. The API response above is the real synchronization point.
    if (prevTotal) {
      await this.page.waitForFunction(
        (old) => {
          const el = document.querySelector('[data-test="cart-total"]');
          return el?.textContent !== old;
        },
        prevTotal,
        { timeout: 10_000 },
      ).catch(() => { /* total unchanged — acceptable for rejected quantities */ });
    }
  }

  async removeRow(rowIndex: number): Promise<void> {
    const row = this.cartItemRows.nth(rowIndex);
    const deletePromise = this.page.waitForResponse(
      r => r.url().includes('/carts') &&
           r.request().method() === 'DELETE' &&
           (r.status() === 200 || r.status() === 204),
      { timeout: 15_000 },
    );
    await this.rowDeleteButton(row).click();
    await deletePromise;
    // API has responded — wait for Angular to remove the row from DOM
    await row.waitFor({ state: 'detached', timeout: 10_000 });
  }

  // ── Cart totals extraction (no hard-coded amounts) ─────────────────────────

  async getCartData(): Promise<CartRowData[]> {
    await this.page.waitForLoadState('networkidle');
    const rows = this.cartItemRows;
    const count = await rows.count();
    const result: CartRowData[] = [];

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');
      const nameText = (await cells.nth(0).textContent()) ?? '';

      const priceText = (await row.getByTestId('product-price').textContent()) ?? '0';
      const qtyText = await this.rowQtyInput(row).inputValue();
      const lineTotalText = (await row.getByTestId('line-price').textContent()) ?? '0';

      result.push({
        name: nameText.trim(),
        unitPrice: parseCurrency(priceText),
        quantity: parseInt(qtyText, 10),
        lineTotal: parseCurrency(lineTotalText),
      });
    }

    return result;
  }

  async getCartTotal(): Promise<number> {
    const text = (await this.cartTotalLabel.textContent()) ?? '0';
    return parseCurrency(text);
  }

  async proceedToCheckout(): Promise<void> {
    // Toolshop checkout is a 4-step accordion. Each step's "Proceed" button shares the
    // same accessible name, so we target steps by their unique data-test ids.
    //
    // Step 1 (Cart): click proceed-1
    const proceed1 = this.page.getByTestId('proceed-1');
    await proceed1.waitFor({ state: 'visible', timeout: 15_000 });
    await proceed1.click();

    // Step 2 (Sign In): authenticated users get a "you are already logged in" proceed-2
    // button. Click it to advance to billing. Targeting proceed-2 by id avoids the strict-
    // mode ambiguity of the shared "Proceed to checkout" label.
    const proceed2 = this.page.getByTestId('proceed-2');
    try {
      await proceed2.waitFor({ state: 'visible', timeout: 10_000 });
      await proceed2.click();
    } catch {
      // proceed-2 never appeared — unauthenticated flow stops at the sign-in form
    }

    // Step 3 (Billing Address): the country select becomes active once we reach it.
    await this.page.getByTestId('country').waitFor({ state: 'visible', timeout: 15_000 });
  }
}
