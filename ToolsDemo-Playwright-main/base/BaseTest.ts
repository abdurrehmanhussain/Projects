import { test as base, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * BaseTest class extends Playwright's test to provide custom fixtures
 * This allows you to inject page objects or other utilities into tests
 */
export const test = base.extend<{
  basePage: BasePage;
}>({
  basePage: async ({ page }, use) => {
    const basePage = new BasePage(page);
    await use(basePage);
  },
});

export { expect } from '@playwright/test';

