import { test as base } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { SignupLoginPage } from '../pages/SignupLoginPage';

/**
 * Custom test fixtures
 * Extend this to add more fixtures for your tests
 *
 * Note: Screenshots on failure are handled by the afterEach hook in test-hooks.ts
 */

// Define fixture types
type PageFixtures = {
  basePage: BasePage;
  homePage: HomePage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  signupLoginPage: SignupLoginPage;
};

// Extend the base test with custom fixtures
export const test = base.extend<PageFixtures>({
  basePage: async ({ page }, use) => {
    const basePage = new BasePage(page);
    await use(basePage);
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  productsPage: async ({ page }, use) => {
    const productsPage = new ProductsPage(page);
    await use(productsPage);
  },

  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },

  signupLoginPage: async ({ page }, use) => {
    const signupLoginPage = new SignupLoginPage(page);
    await use(signupLoginPage);
  },
});

export { expect } from '@playwright/test';

