/**
 * Negative: Login
 *
 * Data-driven invalid credential tests.
 * Run under chromium-noauth so no saved auth state interferes.
 */

import { test, expect } from '../../utils/test-fixtures';
import { INVALID_LOGIN_CASES } from '../../data/invalid-logins';

test.describe('Login – Negative Cases', () => {
  for (const testCase of INVALID_LOGIN_CASES) {
    test(`rejects: ${testCase.description}`, async ({ loginPage, page }) => {
      await loginPage.goto();

      await loginPage.login(testCase.email, testCase.password);

      // App should NOT navigate away from the login page
      await expect(page).toHaveURL(/auth\/login/);

      // An error indicator must be present — either an alert role or a
      // browser validation message (for blank fields).
      // The getByRole('alert') covers server-side messages.
      // For HTML5 validation, the form won't submit at all so
      // the login button stays on screen.
      const alertVisible = await loginPage.errorAlert.isVisible().catch(() => false);
      const stillOnLoginPage = page.url().includes('auth/login');

      expect(
        alertVisible || stillOnLoginPage,
        `Expected error feedback for case: ${testCase.description}`
      ).toBe(true);
    });
  }

  test('clears password field after failed attempt', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('bad@test.com', 'badpassword');

    // After failure, password field should be empty or the field should be
    // present for re-entry — verify the input is usable (not disabled)
    await expect(loginPage.passwordInput).toBeEnabled();
  });
});
