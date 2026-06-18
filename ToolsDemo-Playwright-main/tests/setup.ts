/**
 * Global test setup file
 * Import this file in your test files to enable:
 * - Custom fixtures (basePage)
 * - Automatic screenshots on test failure
 * 
 * Usage in test files:
 * import { test, expect } from './setup';
 */

import { test as baseTest, expect as baseExpect } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import * as fs from 'fs';
import * as path from 'path';

// Extend the base test with custom fixtures
export const test = baseTest.extend<{
  basePage: BasePage;
}>({
  basePage: async ({ page }, use) => {
    const basePage = new BasePage(page);
    await use(basePage);
  },
});

// Add global afterEach hook for screenshot on failure
test.afterEach(async ({ page }, testInfo) => {
  // Take screenshot only on failure
  if (testInfo.status === 'failed' || testInfo.status === 'timedOut') {
    try {
      // Ensure screenshots directory exists
      const screenshotsDir = path.resolve('screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      // Generate timestamped filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
        new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      const testName = testInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${testName}_${timestamp}.png`;
      const screenshotPath = path.join(screenshotsDir, filename);

      // Take full page screenshot
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      console.log(`Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      console.error('Failed to take screenshot on test failure:', error);
    }
  }
});

export { baseExpect as expect };

