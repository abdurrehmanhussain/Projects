import { test, expect } from '../../utils/test-fixtures';
import { BILLING_ADDRESS, BANK_PAYMENT } from '../../data/products';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ homePage, productPage, cartPage }) => {
    // Add one product to cart before each checkout test
    await homePage.goto();
    await homePage.clickProductByIndex(0);
    await productPage.addToCart();
    await cartPage.goto();
  });

  test('proceeds from cart to billing address step @smoke', async ({ cartPage, page }) => {
    await cartPage.proceedToCheckout();

    // After proceeding through sign-in, billing address step should be visible
    await expect(page.getByTestId('country')).toBeVisible();
  });

  test('proceeds through billing to payment step', async ({
    cartPage,
    checkoutPage,
    page,
  }) => {
    await cartPage.proceedToCheckout();

    await checkoutPage.fillBillingAddress(BILLING_ADDRESS);
    await checkoutPage.submitBillingAddress();

    // Payment method select should now be visible
    await expect(checkoutPage.paymentMethodSelect).toBeVisible();
  });

  test('bank-transfer fields appear after selecting Bank Transfer', async ({
    cartPage,
    checkoutPage,
  }) => {
    await cartPage.proceedToCheckout();
    await checkoutPage.fillBillingAddress(BILLING_ADDRESS);
    await checkoutPage.submitBillingAddress();

    await checkoutPage.selectPaymentMethod('bank-transfer');

    expect(await checkoutPage.areBankTransferFieldsVisible()).toBe(true);
  });

  test('credit-card fields appear after selecting Credit Card', async ({
    cartPage,
    checkoutPage,
  }) => {
    await cartPage.proceedToCheckout();
    await checkoutPage.fillBillingAddress(BILLING_ADDRESS);
    await checkoutPage.submitBillingAddress();

    await checkoutPage.selectPaymentMethod('credit-card');

    expect(await checkoutPage.areCreditCardFieldsVisible()).toBe(true);
  });

  test('completes order via bank transfer and shows confirmation', async ({
    cartPage,
    checkoutPage,
    confirmationPage,
  }) => {
    await cartPage.proceedToCheckout();
    await checkoutPage.fillBillingAddress(BILLING_ADDRESS);
    await checkoutPage.submitBillingAddress();

    await checkoutPage.selectPaymentMethod('bank-transfer');
    await checkoutPage.fillBankTransfer(BANK_PAYMENT);
    await checkoutPage.finish();

    expect(await confirmationPage.isOrderConfirmed()).toBe(true);
  });
});
