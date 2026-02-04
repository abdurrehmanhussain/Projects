import { test, expect } from '../utils/test-fixtures';

/**
 * TC02: Navigate to Products page and verify product list
 */
test.describe('Products Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  });

  test('TC02: Navigate to Products page and verify product list', async ({
    homePage,
    productsPage,
  }) => {
    // Navigate to home page
    await homePage.goToHomePage();

    // Go to products page
    await homePage.goToProducts();

    // Verify products page is visible
    const isVisible = await productsPage.isProductsPageVisible();
    expect(isVisible).toBeTruthy();

    // Verify products are displayed
    const productCount = await productsPage.getProductsCount();
    expect(productCount).toBeGreaterThan(0);
  });
});
