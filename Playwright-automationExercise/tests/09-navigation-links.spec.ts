import { test, expect } from '../utils/test-fixtures';

/**
 * TC09: Verify all main navigation links
 */
test.describe('Navigation Links Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  });

  test('TC09: Verify all main navigation links', async ({ homePage, page }) => {
    await homePage.goToHomePage();

    // Test Products link
    await homePage.goToProducts();
    await expect(page).toHaveURL(/products/);

    // Test Cart link
    await homePage.goToCart();
    await expect(page).toHaveURL(/view_cart/);

    // Test Signup/Login link
    await homePage.goToSignupLogin();
    await expect(page).toHaveURL(/login/);

    // Test Home link
    await homePage.goToHomePage();
    await expect(page).toHaveURL(/automationexercise\.com\/?$/);
  });
});
