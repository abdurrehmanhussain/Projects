import { test, expect } from '../utils/test-fixtures';

/**
 * TC01: Verify home page navigation and visibility
 */
test.describe('Home Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  });

  test('TC01: Verify home page navigation and visibility', async ({
    homePage,
  }) => {
    // Navigate to home page
    await homePage.goToHomePage();

    // Verify home page is loaded
    const isVisible = await homePage.isHomePageVisible();
    expect(isVisible).toBeTruthy();

    // Verify page title
    const title = await homePage.getTitle();
    expect(title).toContain('Automation Exercise');
  });
});
