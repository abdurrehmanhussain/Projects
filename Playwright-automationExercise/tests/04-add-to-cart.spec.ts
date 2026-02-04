import { test, expect } from '../utils/test-fixtures';

/**
 * TC04: Add product to cart and verify cart
 */
test.describe('Add to Cart Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  });

  test('TC04: Add product to cart and verify cart', async ({
    homePage,
    productsPage,
    cartPage,
  }) => {
    // Navigate to products page
    await homePage.goToHomePage();
    await homePage.goToProducts();

    // Add first product to cart
    await productsPage.addFirstProductToCart();

    // Click continue shopping
    await productsPage.continueShopping();

    // Go to cart
    await homePage.goToCart();

    // Verify cart has items
    const cartItemsCount = await cartPage.getCartItemsCount();
    expect(cartItemsCount).toBeGreaterThan(0);
  });
});
