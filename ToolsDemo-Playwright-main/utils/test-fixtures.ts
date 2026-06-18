import { test as base, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';

export type Fixtures = {
  basePage: BasePage;
  loginPage: LoginPage;
  homePage: HomePage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  confirmationPage: ConfirmationPage;
};

export const test = base.extend<Fixtures>({
  basePage: async ({ page }, use) => use(new BasePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  homePage: async ({ page }, use) => use(new HomePage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  confirmationPage: async ({ page }, use) => use(new ConfirmationPage(page)),
});

export { expect } from '@playwright/test';
