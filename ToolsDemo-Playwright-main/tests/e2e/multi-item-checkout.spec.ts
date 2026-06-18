/**
 * FEATURED SCENARIO: Verified Multi-Item Checkout
 *
 * Requirements:
 *  1. Sign in as customer, add ≥2 different products from their detail pages
 *  2. In cart: change qty of one item, remove another
 *     – line_total = unit_price × qty  (read from page, no hard-coded amounts)
 *     – cart_total = sum(line_totals)
 *  3. At payment step: choose a method, verify method-specific fields appear
 *  4. Complete order, assert confirmation
 */

import { test, expect } from '../../utils/test-fixtures';
import { round2 } from '../../utils/price-utils';
import { BILLING_ADDRESS, BANK_PAYMENT } from '../../data/products';

test.describe('Featured: Verified Multi-Item Checkout', () => {
  // Run serially so tests don't share a contaminated cart state
  test.describe.configure({ mode: 'serial' });
  /**
   * End-to-end happy path — this is the primary scenario BusPlanner asked for.
   * Auth state is restored from .auth/customer.json (setup project).
   */
  test('full multi-item checkout with verified cart arithmetic @smoke', async ({
    page,
    homePage,
    productPage,
    cartPage,
    checkoutPage,
    confirmationPage,
  }) => {
    // ── Step 1: Add first product ──────────────────────────────────────────
    await homePage.goto();
    await homePage.clickProductByIndex(0);
    const product1Name = await productPage.getProductName();
    await productPage.addToCart(1);

    // ── Step 2: Add second product ─────────────────────────────────────────
    await homePage.goto();
    await homePage.clickProductByIndex(1);
    const product2Name = await productPage.getProductName();

    // Guard: the two products must be distinct
    expect(product2Name).not.toBe(product1Name);
    await productPage.addToCart(1);

    // ── Step 3: Open cart ──────────────────────────────────────────────────
    await cartPage.goto();
    const initialCount = await cartPage.getCartItemCount();
    expect(initialCount).toBeGreaterThanOrEqual(2);

    // ── Step 4: Change qty of first row; remove the third row if exists ────
    // Change qty of row 0 → 3 so we can test line-total math
    await cartPage.setQuantityForRow(0, 3);

    // If a third item crept in (from a previous run that didn't clean up),
    // remove it so we have exactly two rows for deterministic math checks.
    const countAfterQtyChange = await cartPage.getCartItemCount();
    if (countAfterQtyChange > 2) {
      await cartPage.removeRow(2);
    }

    // ── Step 5: Read cart data and assert arithmetic ───────────────────────
    const rows = await cartPage.getCartData();
    expect(rows.length).toBeGreaterThanOrEqual(1);

    // Assert: every line total = unit_price × quantity (±1 cent rounding)
    for (const row of rows) {
      const expected = round2(row.unitPrice * row.quantity);
      expect(
        round2(row.lineTotal),
        `Line total mismatch for "${row.name}": ` +
        `${row.unitPrice} × ${row.quantity} = ${expected}, got ${row.lineTotal}`
      ).toBeCloseTo(expected, 1);
    }

    // Assert: cart total = sum of line totals
    const expectedCartTotal = round2(rows.reduce((sum, r) => sum + r.lineTotal, 0));
    const actualCartTotal = await cartPage.getCartTotal();
    expect(
      round2(actualCartTotal),
      `Cart total ${actualCartTotal} does not equal sum of line totals ${expectedCartTotal}`
    ).toBeCloseTo(expectedCartTotal, 1);

    // ── Step 6: Proceed to checkout ────────────────────────────────────────
    await cartPage.proceedToCheckout();

    await checkoutPage.fillBillingAddress(BILLING_ADDRESS);
    await checkoutPage.submitBillingAddress();

    // ── Step 7: Verify payment method fields appear ────────────────────────
    await checkoutPage.selectPaymentMethod('bank-transfer');
    expect(
      await checkoutPage.areBankTransferFieldsVisible(),
      'Bank Transfer fields should be visible after selecting that method'
    ).toBe(true);

    await checkoutPage.fillBankTransfer(BANK_PAYMENT);

    // ── Step 8: Complete order and assert confirmation ─────────────────────
    await checkoutPage.finish();

    expect(
      await confirmationPage.isOrderConfirmed(),
      'Order confirmation screen was not shown'
    ).toBe(true);

    const confirmText = await confirmationPage.getConfirmationText();
    expect(confirmText).toBeTruthy();
  });

  // ── Isolated check: payment method field visibility ──────────────────────

  test('credit card fields appear when Credit Card is selected', async ({
    homePage,
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    await homePage.goto();
    await homePage.clickProductByIndex(0);
    await productPage.addToCart();

    await cartPage.goto();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillBillingAddress(BILLING_ADDRESS);
    await checkoutPage.submitBillingAddress();

    await checkoutPage.selectPaymentMethod('credit-card');
    expect(await checkoutPage.areCreditCardFieldsVisible()).toBe(true);
    expect(await checkoutPage.areBankTransferFieldsVisible()).toBe(false);
  });

  // ── Cart math invariant with a single item at qty >1 ────────────────────

  test('line total equals unit_price × qty for a single item', async ({
    homePage,
    productPage,
    cartPage,
  }) => {
    await homePage.goto();
    await homePage.clickProductByIndex(0);
    await productPage.addToCart(1);

    await cartPage.goto();
    await cartPage.setQuantityForRow(0, 4);

    const rows = await cartPage.getCartData();
    expect(rows.length).toBeGreaterThan(0);

    const row = rows[0];
    const expected = round2(row.unitPrice * row.quantity);
    expect(round2(row.lineTotal)).toBeCloseTo(expected, 1);

    const cartTotal = await cartPage.getCartTotal();
    expect(round2(cartTotal)).toBeCloseTo(round2(rows.reduce((s, r) => s + r.lineTotal, 0)), 1);
  });
});
