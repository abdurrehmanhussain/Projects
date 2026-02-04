import { test, expect } from '../utils/test-fixtures';
import { testUser, paymentDetails } from './test-data';

/**
 * TC05: Complete E2E flow - Search, Add to Cart, Register, and Checkout
 */
test.describe('Complete E2E Checkout Flow', () => {
  // Increase timeout for this long E2E test (3 minutes)
  test.setTimeout(180000);

  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  });

  test('TC05: Complete E2E flow - Search, Add to Cart, Register, and Checkout', async ({
    homePage,
    productsPage,
    cartPage,
    signupLoginPage,
    checkoutPage,
    page,
  }) => {
    // Step 1: Navigate to home page
    await homePage.goToHomePage();
    await expect(page).toHaveTitle(/Automation Exercise/);

    // Step 2: Navigate to products page
    await homePage.goToProducts();
    const isProductsVisible = await productsPage.isProductsPageVisible();
    expect(isProductsVisible).toBeTruthy();

    // Step 3: Search for a product
    await productsPage.searchProduct('Blue Top');
    const isSearchedVisible = await productsPage.isSearchedProductsVisible();
    expect(isSearchedVisible).toBeTruthy();

    // Step 4: Add product to cart
    await productsPage.addFirstProductToCart();
    await productsPage.continueShopping();

    // Step 5: Go to cart and verify
    await homePage.goToCart();
    const cartItemsCount = await cartPage.getCartItemsCount();
    expect(cartItemsCount).toBeGreaterThan(0);

    // Step 6: Proceed to checkout (will prompt for login)
    await cartPage.proceedToCheckout();

    // Step 7: Click Register/Login
    await cartPage.clickRegisterLogin();

    // Step 8: Complete registration
    await signupLoginPage.startSignup(testUser.name, testUser.email);

    // Step 9: Fill account information
    await signupLoginPage.fillAccountInformation({
      password: testUser.password,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      company: testUser.company,
      address1: testUser.address1,
      address2: testUser.address2,
      country: testUser.country,
      state: testUser.state,
      city: testUser.city,
      zipcode: testUser.zipcode,
      mobileNumber: testUser.mobileNumber,
      day: testUser.birthDay,
      month: testUser.birthMonth,
      year: testUser.birthYear,
      newsletter: true,
      specialOffers: true,
    });

    // Step 10: Create account
    await signupLoginPage.createAccount();

    // Step 11: Verify account created
    const isAccountCreated = await signupLoginPage.isAccountCreated();
    expect(isAccountCreated).toBeTruthy();

    // Step 12: Continue after account creation
    await signupLoginPage.clickContinue();

    // Step 13: Verify logged in
    const isLoggedIn = await homePage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();

    // Step 14: Go to cart again
    await homePage.goToCart();

    // Step 15: Proceed to checkout
    await cartPage.proceedToCheckout();

    // Step 16: Verify checkout page
    const isCheckoutVisible = await checkoutPage.isCheckoutPageVisible();
    expect(isCheckoutVisible).toBeTruthy();

    // Step 17: Add comment and place order
    await checkoutPage.addComment('Please deliver between 9 AM and 5 PM');
    await checkoutPage.placeOrder();

    // Step 18: Enter payment details
    await checkoutPage.enterPaymentDetails(paymentDetails);

    // Step 19: Pay and confirm
    await checkoutPage.payAndConfirm();

    // Step 20: Verify order placed
    const isOrderPlaced = await checkoutPage.isOrderPlacedSuccessfully();
    expect(isOrderPlaced).toBeTruthy();

    // Step 21: Continue and delete account (cleanup)
    await checkoutPage.clickContinue();

    // Step 22: Delete account to clean up
    await homePage.deleteAccount();
  });
});
