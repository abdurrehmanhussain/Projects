import { test, expect } from '../utils/test-fixtures';

/**
 * TC07: Remove product from cart
 */
test.describe('Remove from Cart Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  });

  test('TC07: Remove product from cart', async ({
    homePage,
    productsPage,
    cartPage,
    page,
  }) => {
    // Navigate to products and add item
    await homePage.goToHomePage();
    await homePage.goToProducts();
    await productsPage.addFirstProductToCart();
    await productsPage.viewCart();

    // Verify item in cart
    let cartItemsCount = await cartPage.getCartItemsCount();
    expect(cartItemsCount).toBe(1);

    // Remove item
    await cartPage.removeItemByIndex(0);

    // Wait for item to be removed
    await cartPage.wait(2000);

    // Verify cart is empty - check for "Cart is empty" text on page
    const emptyCartText = page.locator('text=Cart is empty');
    await expect(emptyCartText).toBeVisible({ timeout: 5000 });
  });
});
