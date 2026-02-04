import { test, expect } from '../utils/test-fixtures';

/**
 * TC08: Verify product details in cart
 */
test.describe('Cart Details Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  });

  test('TC08: Verify product details in cart', async ({
    homePage,
    productsPage,
    cartPage,
  }) => {
    // Navigate to products and add item
    await homePage.goToHomePage();
    await homePage.goToProducts();
    await productsPage.addFirstProductToCart();
    await productsPage.viewCart();

    // Get cart item details
    const itemDetails = await cartPage.getCartItemDetails(0);

    // Verify details are present
    expect(itemDetails.name).not.toBe('');
    expect(itemDetails.price).not.toBe('');
    expect(itemDetails.quantity).not.toBe('');
    expect(itemDetails.total).not.toBe('');
  });
});
