import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * CartPage class represents the Shopping Cart page of Automation Exercise
 * Contains methods to interact with cart items and proceed to checkout
 */
export class CartPage extends BasePage {
  // Locators
  readonly cartInfoTable: Locator;
  readonly cartItems: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly registerLoginLink: Locator;
  readonly quantityInput: Locator;
  readonly deleteButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.cartInfoTable = page.locator('#cart_info_table, .table-responsive');
    this.cartItems = page.locator('tr[id^="product-"]');
    this.proceedToCheckoutButton = page.locator('.check_out, a:has-text("Proceed To Checkout")');
    this.emptyCartMessage = page.locator('#empty_cart, p:has-text("Cart is empty"), b:has-text("Cart is empty")');
    this.registerLoginLink = page.locator('#checkoutModal a[href="/login"]');
    this.quantityInput = page.locator('.cart_quantity');
    this.deleteButtons = page.locator('.cart_quantity_delete');
  }

  /**
   * Navigate to cart page
   */
  async goToCartPage(): Promise<void> {
    await this.navigateTo('/view_cart');
  }

  /**
   * Verify cart page is visible
   */
  async isCartPageVisible(): Promise<boolean> {
    return await this.isVisible(this.cartInfoTable);
  }

  /**
   * Get number of items in cart
   */
  async getCartItemsCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Get cart item details by index
   */
  async getCartItemDetails(index: number): Promise<{
    name: string;
    price: string;
    quantity: string;
    total: string;
  }> {
    const row = this.cartItems.nth(index);
    return {
      name: (await row.locator('.cart_description h4 a').textContent()) || '',
      price: (await row.locator('.cart_price p').textContent()) || '',
      quantity: (await row.locator('.cart_quantity button').textContent()) || '',
      total: (await row.locator('.cart_total p').textContent()) || '',
    };
  }

  /**
   * Remove item from cart by index
   */
  async removeItemByIndex(index: number): Promise<void> {
    await this.click(this.deleteButtons.nth(index));
  }

  /**
   * Remove all items from cart
   */
  async clearCart(): Promise<void> {
    const count = await this.deleteButtons.count();
    for (let i = count - 1; i >= 0; i--) {
      await this.click(this.deleteButtons.nth(i));
      await this.wait(500);
    }
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout(): Promise<void> {
    await this.click(this.proceedToCheckoutButton);
  }

  /**
   * Click register/login link in checkout modal
   */
  async clickRegisterLogin(): Promise<void> {
    await this.click(this.registerLoginLink);
  }

  /**
   * Verify cart is empty
   */
  async isCartEmpty(): Promise<boolean> {
    return await this.isVisible(this.emptyCartMessage);
  }

  /**
   * Get all product names in cart
   */
  async getCartProductNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.cartItems.count();
    for (let i = 0; i < count; i++) {
      const name = await this.cartItems.nth(i).locator('.cart_description h4 a').textContent();
      if (name) names.push(name);
    }
    return names;
  }

  /**
   * Verify product exists in cart
   */
  async isProductInCart(productName: string): Promise<boolean> {
    const names = await this.getCartProductNames();
    return names.some((name) => name.toLowerCase().includes(productName.toLowerCase()));
  }
}
