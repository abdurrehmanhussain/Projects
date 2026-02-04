import { test, expect } from '../utils/test-fixtures';

/**
 * TC06: Add multiple products to cart
 */
test.describe('Multiple Products Cart Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  });

  test('TC06: Add multiple products to cart', async ({
    homePage,
    productsPage,
    cartPage,
  }) => {
    // Navigate to products page
    await homePage.goToHomePage();
    await homePage.goToProducts();

    // Add first product
    await productsPage.addProductToCartByIndex(0);
    await productsPage.continueShopping();

    // Add second product
    await productsPage.addProductToCartByIndex(1);
    await productsPage.continueShopping();

    // Go to cart
    await homePage.goToCart();

    // Verify cart has 2 items
    const cartItemsCount = await cartPage.getCartItemsCount();
    expect(cartItemsCount).toBe(2);
  });
});
