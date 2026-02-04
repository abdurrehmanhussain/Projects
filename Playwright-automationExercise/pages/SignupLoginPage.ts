import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * SignupLoginPage class represents the Signup/Login page of Automation Exercise
 * Contains methods to signup new users and login existing users
 */
export class SignupLoginPage extends BasePage {
  // Login Form Locators
  readonly loginEmailInput: Locator;
  readonly loginPasswordInput: Locator;
  readonly loginButton: Locator;
  readonly loginErrorMessage: Locator;

  // Signup Form Locators
  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupButton: Locator;
  readonly signupErrorMessage: Locator;

  // Account Information Form Locators (after signup)
  readonly titleMr: Locator;
  readonly titleMrs: Locator;
  readonly passwordInput: Locator;
  readonly daysDropdown: Locator;
  readonly monthsDropdown: Locator;
  readonly yearsDropdown: Locator;
  readonly newsletterCheckbox: Locator;
  readonly specialOffersCheckbox: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly companyInput: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly countryDropdown: Locator;
  readonly stateInput: Locator;
  readonly cityInput: Locator;
  readonly zipcodeInput: Locator;
  readonly mobileNumberInput: Locator;
  readonly createAccountButton: Locator;

  // Account Created Page Locators
  readonly accountCreatedMessage: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    // Login form
    this.loginEmailInput = page.locator('[data-qa="login-email"]');
    this.loginPasswordInput = page.locator('[data-qa="login-password"]');
    this.loginButton = page.locator('[data-qa="login-button"]');
    this.loginErrorMessage = page.locator('form[action="/login"] p');

    // Signup form
    this.signupNameInput = page.locator('[data-qa="signup-name"]');
    this.signupEmailInput = page.locator('[data-qa="signup-email"]');
    this.signupButton = page.locator('[data-qa="signup-button"]');
    this.signupErrorMessage = page.locator('form[action="/signup"] p');

    // Account information form
    this.titleMr = page.locator('#id_gender1');
    this.titleMrs = page.locator('#id_gender2');
    this.passwordInput = page.locator('[data-qa="password"]');
    this.daysDropdown = page.locator('[data-qa="days"]');
    this.monthsDropdown = page.locator('[data-qa="months"]');
    this.yearsDropdown = page.locator('[data-qa="years"]');
    this.newsletterCheckbox = page.locator('#newsletter');
    this.specialOffersCheckbox = page.locator('#optin');
    this.firstNameInput = page.locator('[data-qa="first_name"]');
    this.lastNameInput = page.locator('[data-qa="last_name"]');
    this.companyInput = page.locator('[data-qa="company"]');
    this.address1Input = page.locator('[data-qa="address"]');
    this.address2Input = page.locator('[data-qa="address2"]');
    this.countryDropdown = page.locator('[data-qa="country"]');
    this.stateInput = page.locator('[data-qa="state"]');
    this.cityInput = page.locator('[data-qa="city"]');
    this.zipcodeInput = page.locator('[data-qa="zipcode"]');
    this.mobileNumberInput = page.locator('[data-qa="mobile_number"]');
    this.createAccountButton = page.locator('[data-qa="create-account"]');

    // Account created page
    this.accountCreatedMessage = page.locator('[data-qa="account-created"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }

  /**
   * Navigate to signup/login page
   */
  async goToSignupLoginPage(): Promise<void> {
    await this.navigateTo('/login');
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<void> {
    await this.type(this.loginEmailInput, email);
    await this.type(this.loginPasswordInput, password);
    await this.click(this.loginButton);
  }

  /**
   * Start signup process with name and email
   */
  async startSignup(name: string, email: string): Promise<void> {
    await this.type(this.signupNameInput, name);
    await this.type(this.signupEmailInput, email);
    await this.click(this.signupButton);
  }

  /**
   * Fill account information form
   */
  async fillAccountInformation(accountInfo: {
    password: string;
    day?: string;
    month?: string;
    year?: string;
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    country: string;
    state: string;
    city: string;
    zipcode: string;
    mobileNumber: string;
    newsletter?: boolean;
    specialOffers?: boolean;
    title?: 'Mr' | 'Mrs';
  }): Promise<void> {
    // Select title
    if (accountInfo.title === 'Mrs') {
      await this.click(this.titleMrs);
    } else {
      await this.click(this.titleMr);
    }

    // Fill password
    await this.type(this.passwordInput, accountInfo.password);

    // Select date of birth
    if (accountInfo.day) {
      await this.selectOption(this.daysDropdown, accountInfo.day);
    }
    if (accountInfo.month) {
      await this.selectOption(this.monthsDropdown, accountInfo.month);
    }
    if (accountInfo.year) {
      await this.selectOption(this.yearsDropdown, accountInfo.year);
    }

    // Check newsletter and special offers
    if (accountInfo.newsletter) {
      await this.setCheckbox(this.newsletterCheckbox, true);
    }
    if (accountInfo.specialOffers) {
      await this.setCheckbox(this.specialOffersCheckbox, true);
    }

    // Fill address information
    await this.type(this.firstNameInput, accountInfo.firstName);
    await this.type(this.lastNameInput, accountInfo.lastName);
    if (accountInfo.company) {
      await this.type(this.companyInput, accountInfo.company);
    }
    await this.type(this.address1Input, accountInfo.address1);
    if (accountInfo.address2) {
      await this.type(this.address2Input, accountInfo.address2);
    }
    await this.selectOption(this.countryDropdown, accountInfo.country);
    await this.type(this.stateInput, accountInfo.state);
    await this.type(this.cityInput, accountInfo.city);
    await this.type(this.zipcodeInput, accountInfo.zipcode);
    await this.type(this.mobileNumberInput, accountInfo.mobileNumber);
  }

  /**
   * Click create account button
   */
  async createAccount(): Promise<void> {
    await this.click(this.createAccountButton);
  }

  /**
   * Verify account created successfully
   */
  async isAccountCreated(): Promise<boolean> {
    return await this.isVisible(this.accountCreatedMessage);
  }

  /**
   * Click continue after account creation
   */
  async clickContinue(): Promise<void> {
    await this.click(this.continueButton);
  }

  /**
   * Get login error message
   */
  async getLoginError(): Promise<string> {
    return await this.getText(this.loginErrorMessage);
  }

  /**
   * Get signup error message
   */
  async getSignupError(): Promise<string> {
    return await this.getText(this.signupErrorMessage);
  }

  /**
   * Complete full signup process
   */
  async completeSignup(
    name: string,
    email: string,
    accountInfo: {
      password: string;
      firstName: string;
      lastName: string;
      address1: string;
      country: string;
      state: string;
      city: string;
      zipcode: string;
      mobileNumber: string;
    }
  ): Promise<void> {
    await this.startSignup(name, email);
    await this.fillAccountInformation(accountInfo);
    await this.createAccount();
  }
}
