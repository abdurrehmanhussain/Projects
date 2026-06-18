import { Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * Example Page Object Model class
 * This is a template for creating page objects
 * 
 * Replace this with your actual page objects following the same pattern
 */
export class ExamplePage extends BasePage {
  // Define locators as private readonly properties
  // Example locators (replace with your actual locators)
  private readonly heading = 'h1';
  private readonly submitButton = '#submit-button';
  private readonly inputField = '#input-field';

  constructor(page: Page) {
    super(page);
  }

  // Example methods (replace with your actual page methods)
  
  /**
   * Get the page heading text
   * @returns The heading text
   */
  async getHeadingText(): Promise<string> {
    return await this.getText(this.heading);
  }

  /**
   * Click the submit button
   */
  async clickSubmitButton(): Promise<void> {
    await this.click(this.submitButton);
  }

  /**
   * Enter text in the input field
   * @param text - Text to enter
   */
  async enterText(text: string): Promise<void> {
    await this.type(this.inputField, text);
  }

  /**
   * Wait for the page to load
   */
  async waitForPageLoad(): Promise<void> {
    await this.waitForElement(this.heading);
  }
}

