import { test, expect } from '../../utils/test-fixtures';
import { users } from '../../data/users';

test.describe('Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('signs in with valid customer credentials @smoke', async ({ page, loginPage }) => {
    await loginPage.login(users.customer.email, users.customer.password);

    await expect(loginPage.postLoginHeading).toBeVisible();
    await expect(page).not.toHaveURL(/auth\/login/);
  });

  test('shows error for wrong password', async ({ loginPage }) => {
    await loginPage.login(users.customer.email, 'wrongpassword123');

    await expect(loginPage.errorAlert).toBeVisible();
    const message = await loginPage.getErrorMessage();
    expect(message.toLowerCase()).toMatch(/invalid email or password/);
  });

  test('shows error for non-existent account', async ({ loginPage }) => {
    await loginPage.login('nobody@example.com', 'welcome01');

    await expect(loginPage.errorAlert).toBeVisible();
  });

  test('stays on login page after failed attempt', async ({ page, loginPage }) => {
    await loginPage.login('bad@email.com', 'badpass');

    await expect(page).toHaveURL(/auth\/login/);
  });
});
