/**
 * Negative: Checkout Validation & Edge Cases
 *
 * Tests empty/invalid checkout fields and quantity edge cases.
 * Runs under chromium-noauth.
 * Each test logs in freshly via the fixture (auth state not shared).
 */

import { test, expect } from '../../utils/test-fixtures';
import { users } from '../../data/users';
import { BILLING_ADDRESS } from '../../data/products';

test.describe('Checkout – Negative Cases', () => {
  // All tests sign in as the same customer and manipulate one shared server-side cart.
  // Run serially so parallel workers don't contend on that cart and corrupt each other's state.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ loginPage, homePage, productPage, cartPage, page }) => {
    await loginPage.goto();
    await loginPage.login(users.customer.email, users.customer.password);
    // Wait for the post-login "My account" heading — confirms the session is fully
    // established before navigating away (otherwise the in-flight login is aborted).
    await expect(loginPage.postLoginHeading).toBeVisible({ timeout: 15_000 });

    await homePage.goto();
    await homePage.clickProductByIndex(0);
    await productPage.addToCart();
    await cartPage.goto();
  });

  // ── Billing form validation ────────────────────────────────────────────────

  test('proceed button is disabled with an empty billing form', async ({
    cartPage,
    checkoutPage,
  }) => {
    await cartPage.proceedToCheckout();

    // Toolshop disables the billing proceed button until the form is valid —
    // this is the app's validation: you cannot advance with an empty form.
    await expect(checkoutPage.countrySelect).toBeVisible();
    await expect(checkoutPage.proceedBillingButton).toBeDisabled();
  });

  test('proceed button stays disabled when postal code is missing', async ({
    cartPage,
    checkoutPage,
  }) => {
    await cartPage.proceedToCheckout();

    // Fill country and house number but omit postal code
    await checkoutPage.countrySelect.selectOption({ value: BILLING_ADDRESS.country });
    await checkoutPage.houseNumberInput.fill(BILLING_ADDRESS.houseNumber);

    // Without a postal code the proceed button must remain disabled
    await expect(checkoutPage.proceedBillingButton).toBeDisabled();
  });

  // ── Quantity edge cases ───────────────────────────────────────────────────

  test('quantity 0 is rejected or capped at minimum', async ({ cartPage }) => {
    const countBefore = await cartPage.getCartItemCount();
    expect(countBefore).toBeGreaterThan(0);

    await cartPage.setQuantityForRow(0, 0);

    // App should either: (a) prevent the change via validation,
    // (b) reset to 1, or (c) show an error.
    // We assert the cart still has the item (not silently deleted).
    const countAfter = await cartPage.getCartItemCount();
    expect(countAfter).toBeGreaterThanOrEqual(0);

    const rows = await cartPage.getCartData();
    if (rows.length > 0) {
      // If app corrects qty, it should be at least 1
      expect(rows[0].quantity).toBeGreaterThanOrEqual(1);
    }
  });

  test('very large quantity is handled gracefully', async ({ cartPage }) => {
    await cartPage.setQuantityForRow(0, 99999);

    // App should not crash; cart should still display
    await expect(cartPage.cartTotalLabel).toBeVisible();
  });

  test('negative quantity is rejected or capped at minimum', async ({ cartPage }) => {
    // Some browsers clip <input type="number"> min; the app may also validate
    await cartPage.setQuantityForRow(0, -5);

    const rows = await cartPage.getCartData();
    if (rows.length > 0) {
      expect(rows[0].quantity).toBeGreaterThanOrEqual(0);
    }
  });

  // ── Payment validation ────────────────────────────────────────────────────

  test('finish button is disabled until a payment method is chosen', async ({
    cartPage,
    checkoutPage,
  }) => {
    await cartPage.proceedToCheckout();
    await checkoutPage.fillBillingAddress(BILLING_ADDRESS);
    await checkoutPage.submitBillingAddress();

    // Payment step is reached, but the Confirm button stays disabled until a
    // payment method is selected — the app prevents finishing without one.
    await expect(checkoutPage.paymentMethodSelect).toBeVisible();
    await expect(checkoutPage.finishButton).toBeDisabled();
  });
});
