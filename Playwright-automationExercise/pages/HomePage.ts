import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * HomePage class represents the Home page of Automation Exercise
 * Contains methods to interact with home page elements
 */
export class HomePage extends BasePage {
  // Locators
  readonly logo: Locator;
  readonly homeLink: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly signupLoginLink: Locator;
  readonly logoutLink: Locator;
  readonly deleteAccountLink: Locator;
  readonly loggedInAsText: Locator;
  readonly contactUsLink: Locator;
  readonly testCasesLink: Locator;
  readonly featuredItems: Locator;
  readonly subscriptionInput: Locator;
  readonly subscribeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.logo = page.locator('img[alt="Website for automation practice"]');
    this.homeLink = page.locator('a[href="/"]').filter({ hasText: 'Home' });
    this.productsLink = page.locator('a[href="/products"]');
    this.cartLink = page.locator('a[href="/view_cart"]').first();
    this.signupLoginLink = page.locator('a[href="/login"]');
    this.logoutLink = page.locator('a[href="/logout"]');
    this.deleteAccountLink = page.locator('a[href="/delete_account"]');
    this.loggedInAsText = page.locator('a:has-text("Logged in as")');
    this.contactUsLink = page.locator('a[href="/contact_us"]');
    this.testCasesLink = page.locator('a[href="/test_cases"]');
    this.featuredItems = page.locator('.features_items');
    this.subscriptionInput = page.locator('#susbscribe_email');
    this.subscribeButton = page.locator('#subscribe');
  }

  /**
   * Navigate to home page
   */
  async goToHomePage(): Promise<void> {
    await this.navigateTo('/');
  }

  /**
   * Verify home page is loaded
   */
  async isHomePageVisible(): Promise<boolean> {
    return await this.isVisible(this.logo);
  }

  /**
   * Navigate to Products page
   */
  async goToProducts(): Promise<void> {
    await this.click(this.productsLink);
  }

  /**
   * Navigate to Cart page
   */
  async goToCart(): Promise<void> {
    await this.click(this.cartLink);
  }

  /**
   * Navigate to Signup/Login page
   */
  async goToSignupLogin(): Promise<void> {
    await this.click(this.signupLoginLink);
  }

  /**
   * Logout from the application
   */
  async logout(): Promise<void> {
    await this.click(this.logoutLink);
  }

  /**
   * Delete account
   */
  async deleteAccount(): Promise<void> {
    await this.click(this.deleteAccountLink);
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.isVisible(this.loggedInAsText);
  }

  /**
   * Get logged in username
   */
  async getLoggedInUsername(): Promise<string> {
    const text = await this.getText(this.loggedInAsText);
    return text.replace('Logged in as ', '');
  }

  /**
   * Subscribe to newsletter
   */
  async subscribeNewsletter(email: string): Promise<void> {
    await this.type(this.subscriptionInput, email);
    await this.click(this.subscribeButton);
  }
}
