import { test, expect } from '../../utils/test-fixtures';
import { SORT_OPTIONS } from '../../data/products';

test.describe('Product Discovery', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  // ── Search ─────────────────────────────────────────────────────────────────

  test('finds products by keyword search @smoke', async ({ homePage, page }) => {
    await homePage.search('pliers');

    // Toolshop uses full-text search (description + name) so results include
    // products that mention "pliers" in their description, not just their title.
    // We assert: (1) results were returned, (2) the results page confirms the query,
    // (3) at least one plier-type tool appears in the results.
    const names = await homePage.getProductNames();
    expect(names.length, 'Search should return at least one result').toBeGreaterThan(0);

    await expect(page.getByText(/searched for.*pliers/i)).toBeVisible();

    const plierHits = names.filter(n => n.toLowerCase().includes('plier'));
    expect(
      plierHits.length,
      `Expected plier products in results but got: ${names.slice(0, 5).join(', ')}`
    ).toBeGreaterThan(0);
  });

  test('shows no-results message for unknown search term', async ({ homePage }) => {
    await homePage.search('xyznotaproduct12345');

    await expect(homePage.noResultsMessage).toBeVisible();
    const names = await homePage.getProductNames();
    expect(names.length).toBe(0);
  });

  // ── Sort ───────────────────────────────────────────────────────────────────

  test('sorts products by price ascending', async ({ homePage, page }) => {
    await homePage.sortBy(SORT_OPTIONS.priceAsc);

    // Verify sort changed (page URL or some heading reflects the change)
    await expect(homePage.sortSelect).toHaveValue(SORT_OPTIONS.priceAsc);

    // Optionally: extract displayed prices and assert ascending order
    // (requires price locators — add if the app exposes them on the card)
  });

  test('sorts products by name A-Z', async ({ homePage }) => {
    await homePage.sortBy(SORT_OPTIONS.nameAsc);
    await expect(homePage.sortSelect).toHaveValue(SORT_OPTIONS.nameAsc);

    const names = await homePage.getProductNames();
    if (names.length > 1) {
      const sorted = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sorted);
    }
  });

  // ── Filter ────────────────────────────────────────────────────────────────

  test('filters products by category', async ({ homePage }) => {
    const initialCount = (await homePage.getProductNames()).length;

    await homePage.filterByCategory('Hammer');

    const filteredNames = await homePage.getProductNames();
    // Filtering should reduce or maintain the count (not increase it)
    expect(filteredNames.length).toBeGreaterThan(0);
    expect(filteredNames.length).toBeLessThanOrEqual(initialCount);
  });

  // ── Product detail ────────────────────────────────────────────────────────

  test('navigates to product detail page on click @smoke', async ({ homePage, productPage, page }) => {
    const names = await homePage.getProductNames();
    expect(names.length, 'No products on homepage').toBeGreaterThan(0);

    await homePage.clickProductByIndex(0);

    // Product detail page should display a product name heading
    await expect(productPage.productNameHeading).toBeVisible();
    await expect(productPage.unitPriceLabel).toBeVisible();
    await expect(productPage.addToCartButton).toBeEnabled();
  });
});
