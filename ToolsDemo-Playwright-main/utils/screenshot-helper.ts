import { Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Helper functions for screenshot management
 */

/**
 * Take a timestamped screenshot and save it to the screenshots directory
 * @param page - Playwright page instance
 * @param testName - Name of the test (optional)
 * @returns Path to the saved screenshot
 */
export async function takeTimestampedScreenshot(
  page: Page,
  testName?: string
): Promise<string> {
  // Ensure screenshots directory exists
  const screenshotsDir = path.resolve('screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Generate timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
    new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  
  // Generate filename
  const testNameSanitized = testName
    ? testName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    : 'screenshot';
  const filename = `${testNameSanitized}_${timestamp}.png`;
  const filepath = path.join(screenshotsDir, filename);

  // Take screenshot
  await page.screenshot({
    path: filepath,
    fullPage: true,
  });

  return filepath;
}

