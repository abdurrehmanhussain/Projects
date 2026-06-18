# Pages Directory

This directory contains Page Object Model (POM) classes for your application.

## Structure

Each page object should:
- Extend the `BasePage` class from `../base/BasePage.ts`
- Represent a single page or component of your application
- Contain locators and methods specific to that page
- Follow the naming convention: `PageNamePage.ts` (e.g., `LoginPage.ts`, `HomePage.ts`)

## Example Page Object

```typescript
import { Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class LoginPage extends BasePage {
  // Locators
  private readonly usernameInput = '#username';
  private readonly passwordInput = '#password';
  private readonly loginButton = '#login-button';
  private readonly errorMessage = '.error-message';

  constructor(page: Page) {
    super(page);
  }

  // Methods
  async enterUsername(username: string): Promise<void> {
    await this.type(this.usernameInput, username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.type(this.passwordInput, password);
  }

  async clickLoginButton(): Promise<void> {
    await this.click(this.loginButton);
  }

  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }
}
```

