import { Page, Locator, expect } from '@playwright/test';
import { config } from '../config/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * BasePage class provides common functionality for all page objects
 * All page objects should extend this class to inherit common methods
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   * @param url - The URL or path to navigate to (relative paths will use baseURL)
   */
  async navigateTo(url: string = ''): Promise<void> {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      await this.page.goto(url);
    } else {
      await this.page.goto(url, { waitUntil: 'networkidle' });
    }
  }

  /**
   * Click on an element
   * @param locator - The locator of the element to click
   * @param options - Optional click options
   */
  async click(locator: string | Locator, options?: { timeout?: number }): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.click(options);
  }

  /**
   * Type text into an input field
   * @param locator - The locator of the input field
   * @param text - The text to type
   * @param options - Optional type options
   */
  async type(locator: string | Locator, text: string, options?: { delay?: number; timeout?: number }): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.fill(text, options);
  }

  /**
   * Get text content from an element
   * @param locator - The locator of the element
   * @returns The text content of the element
   */
  async getText(locator: string | Locator): Promise<string> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    return await element.textContent() || '';
  }

  /**
   * Wait for an element to be visible
   * @param locator - The locator of the element
   * @param timeout - Optional timeout in milliseconds
   */
  async waitForElement(locator: string | Locator, timeout?: number): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'visible', timeout: timeout || config.timeouts.action });
  }

  /**
   * Wait for an element to be hidden
   * @param locator - The locator of the element
   * @param timeout - Optional timeout in milliseconds
   */
  async waitForElementHidden(locator: string | Locator, timeout?: number): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.waitFor({ state: 'hidden', timeout: timeout || config.timeouts.action });
  }

  /**
   * Check if an element is visible
   * @param locator - The locator of the element
   * @returns True if element is visible, false otherwise
   */
  async isVisible(locator: string | Locator): Promise<boolean> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    return await element.isVisible().catch(() => false);
  }

  /**
   * Get the page title
   * @returns The page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get the current URL
   * @returns The current URL
   */
  getCurrentURL(): string {
    return this.page.url();
  }

  /**
   * Wait for navigation
   * @param options - Optional navigation options
   */
  async waitForNavigation(options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }): Promise<void> {
    await this.page.waitForLoadState(options?.waitUntil || 'networkidle');
  }

  /**
   * Hover over an element
   * @param locator - The locator of the element
   */
  async hover(locator: string | Locator): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.hover();
  }

  /**
   * Select an option from a dropdown
   * @param locator - The locator of the dropdown
   * @param value - The value to select
   */
  async selectOption(locator: string | Locator, value: string): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.selectOption(value);
  }

  /**
   * Check or uncheck a checkbox
   * @param locator - The locator of the checkbox
   * @param checked - True to check, false to uncheck
   */
  async setCheckbox(locator: string | Locator, checked: boolean): Promise<void> {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    if (checked) {
      await element.check();
    } else {
      await element.uncheck();
    }
  }

  /**
   * Take a screenshot
   * @param filename - Optional filename for the screenshot (without extension)
   */
  async takeScreenshot(filename?: string): Promise<string> {
    const screenshotsDir = path.resolve('screenshots');
    
    // Ensure screenshots directory exists
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Generate timestamped filename if not provided
    let screenshotPath: string;
    if (filename) {
      screenshotPath = path.join(screenshotsDir, `${filename}.png`);
    } else {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' +
        new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      screenshotPath = path.join(screenshotsDir, `screenshot-${timestamp}.png`);
    }
    
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  }

  /**
   * Wait for a specific timeout
   * @param milliseconds - Time to wait in milliseconds
   */
  async wait(milliseconds: number): Promise<void> {
    await this.page.waitForTimeout(milliseconds);
  }

  /**
   * Press a key
   * @param key - The key to press (e.g., 'Enter', 'Escape', 'Tab')
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }
}

