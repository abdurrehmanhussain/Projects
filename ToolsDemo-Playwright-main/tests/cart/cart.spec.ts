import { test, expect } from '../../utils/test-fixtures';

test.describe('Cart', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('adds a product to the cart from its detail page @smoke', async ({
    homePage,
    productPage,
    cartPage,
  }) => {
    await homePage.clickProductByIndex(0);

    const productName = await productPage.getProductName();
    expect(productName).toBeTruthy();

    await productPage.addToCart();

    // Navigate to cart and confirm the item is there
    await cartPage.goto();
    const count = await cartPage.getCartItemCount();
    expect(count).toBeGreaterThan(0);
  });

  test('cart reflects correct item count in nav badge', async ({
    homePage,
    productPage,
  }) => {
    await homePage.clickProductByIndex(0);
    await productPage.addToCart();

    const badge = await productPage.getCartBadgeCount();
    expect(badge).toBeGreaterThanOrEqual(1);
  });

  test('cart total updates when quantity is changed', async ({
    homePage,
    productPage,
    cartPage,
  }) => {
    await homePage.clickProductByIndex(0);
    await productPage.addToCart(1);

    await cartPage.goto();
    const before = await cartPage.getCartTotal();

    await cartPage.setQuantityForRow(0, 3);
    const after = await cartPage.getCartTotal();

    // Total should have increased (unless price is 0, which won't happen)
    expect(after).toBeGreaterThan(before);
  });

  test('removing an item decreases the cart row count', async ({
    homePage,
    productPage,
    cartPage,
  }) => {
    await homePage.clickProductByIndex(0);
    await productPage.addToCart();

    await cartPage.goto();
    const countBefore = await cartPage.getCartItemCount();
    expect(countBefore).toBeGreaterThan(0);

    await cartPage.removeRow(0);
    const countAfter = await cartPage.getCartItemCount();
    expect(countAfter).toBe(countBefore - 1);
  });
});
