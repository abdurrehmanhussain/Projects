import { test, expect } from '../utils/test-fixtures';

/**
 * TC10: Verify newsletter subscription
 */
test.describe('Newsletter Subscription Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  });

  test('TC10: Verify newsletter subscription', async ({ homePage, page }) => {
    await homePage.goToHomePage();

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Subscribe to newsletter
    const testEmail = `newsletter_${Date.now()}@test.com`;
    await homePage.subscribeNewsletter(testEmail);

    // Verify success message appears
    const successMessage = page.locator('.alert-success');
    await expect(successMessage).toBeVisible();
  });
});
