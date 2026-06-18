import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class LoginPage extends BasePage {
  // ── ARIA-first locators ────────────────────────────────────────────────────
  get emailInput(): Locator {
    return this.page.getByLabel(/email address/i);
  }
  get passwordInput(): Locator {
    return this.page.getByLabel(/^password/i);
  }
  get loginButton(): Locator {
    // Button text is "Login" on the Toolshop form
    return this.page.getByRole('button', { name: /login/i });
  }
  get errorAlert(): Locator {
    return this.page.getByTestId('login-error');
  }
  // Nav link that takes anonymous users to the login page
  get signInNavLink(): Locator {
    return this.page.getByRole('link', { name: /sign in/i });
  }
  // After login Toolshop redirects to "My account" — this heading confirms success
  get postLoginHeading(): Locator {
    return this.page.getByRole('heading', { name: 'My account' });
  }
  // After login the nav shows a user menu button (data-test="nav-menu") with the user's name.
  // This element only exists when authenticated — no false positives.
  get userNavButton(): Locator {
    return this.page.getByTestId('nav-menu');
  }

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    // Angular SPA — hash routing doesn't always process before networkidle fires.
    // Navigate to root, then click the nav "Sign in" link so Angular handles the
    // route change normally and the login form renders reliably.
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    await this.signInNavLink.click();
    await this.emailInput.waitFor({ state: 'visible', timeout: 20_000 });
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.errorAlert.waitFor({ state: 'visible' });
    return (await this.errorAlert.textContent()) ?? '';
  }

  async isLoggedIn(): Promise<boolean> {
    return this.postLoginHeading.isVisible().catch(() => false);
  }
}
