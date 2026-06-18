import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { config } from '../../config/config';
import { LoginPage } from '../../pages/LoginPage';

/**
 * Runs once before all authenticated test projects.
 * Logs in as customer, saves browser storage state to .auth/customer.json
 * so subsequent tests skip the login UI entirely.
 */
setup('authenticate as customer', async ({ page }) => {
  const authDir = path.dirname(config.authStatePath);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(config.users.customer.email, config.users.customer.password);

  // After login Toolshop redirects to "My account" — confirm we're there
  await expect(loginPage.postLoginHeading).toBeVisible({ timeout: 15_000 });

  await page.context().storageState({ path: config.authStatePath });
});
