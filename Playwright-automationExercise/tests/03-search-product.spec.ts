import { test, expect } from '../utils/test-fixtures';

/**
 * TC03: Search for a product and verify results
 */
test.describe('Search Product Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  });

  test('TC03: Search for a product and verify results', async ({
    homePage,
    productsPage,
  }) => {
    const searchTerm = 'Blue Top';

    // Navigate to products page
    await homePage.goToHomePage();
    await homePage.goToProducts();

    // Search for product
    await productsPage.searchProduct(searchTerm);

    // Verify search results
    const isSearchedVisible = await productsPage.isSearchedProductsVisible();
    expect(isSearchedVisible).toBeTruthy();

    // Verify at least one product is found
    const productCount = await productsPage.getProductsCount();
    expect(productCount).toBeGreaterThan(0);
  });
});
