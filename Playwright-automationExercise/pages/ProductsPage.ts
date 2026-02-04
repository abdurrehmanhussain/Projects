import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * ProductsPage class represents the Products page of Automation Exercise
 * Contains methods to search, view, and add products to cart
 */
export class ProductsPage extends BasePage {
  // Locators
  readonly allProductsTitle: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchedProductsTitle: Locator;
  readonly productsList: Locator;
  readonly productCards: Locator;
  readonly firstProductViewButton: Locator;
  readonly firstProductAddToCartButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly viewCartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.allProductsTitle = page.locator('h2.title:has-text("All Products"), h2.title:has-text("ALL PRODUCTS")');
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.searchedProductsTitle = page.locator('h2.title:has-text("Searched Products"), h2.title:has-text("SEARCHED PRODUCTS")');
    this.productsList = page.locator('.features_items');
    this.productCards = page.locator('.features_items .product-image-wrapper');
    this.firstProductViewButton = page.locator('.features_items .choose a').first();
    this.firstProductAddToCartButton = page.locator('.features_items .add-to-cart').first();
    this.continueShoppingButton = page.locator('button:has-text("Continue Shopping")');
    this.viewCartLink = page.locator('a:has-text("View Cart")').first();
  }

  /**
   * Navigate to products page
   */
  async goToProductsPage(): Promise<void> {
    await this.navigateTo('/products');
  }

  /**
   * Verify products page is visible
   */
  async isProductsPageVisible(): Promise<boolean> {
    try {
      await this.allProductsTitle.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return await this.isVisible(this.allProductsTitle);
    }
  }

  /**
   * Search for a product
   */
  async searchProduct(productName: string): Promise<void> {
    await this.type(this.searchInput, productName);
    await this.click(this.searchButton);
  }

  /**
   * Verify searched products are visible
   */
  async isSearchedProductsVisible(): Promise<boolean> {
    try {
      await this.searchedProductsTitle.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return await this.isVisible(this.searchedProductsTitle);
    }
  }

  /**
   * Get count of products displayed
   */
  async getProductsCount(): Promise<number> {
    return await this.productCards.count();
  }

  /**
   * View first product details
   */
  async viewFirstProduct(): Promise<void> {
    await this.click(this.firstProductViewButton);
  }

  /**
   * Add first product to cart
   */
  async addFirstProductToCart(): Promise<void> {
    await this.hover(this.productCards.first());
    await this.click(this.productCards.first().locator('.add-to-cart').first());
  }

  /**
   * Add product to cart by index
   */
  async addProductToCartByIndex(index: number): Promise<void> {
    const productCard = this.productCards.nth(index);
    await this.hover(productCard);
    await this.click(productCard.locator('.add-to-cart').first());
  }

  /**
   * Add product to cart by name
   */
  async addProductToCartByName(productName: string): Promise<void> {
    const productCard = this.page.locator(`.features_items .product-image-wrapper:has-text("${productName}")`);
    await this.hover(productCard);
    await productCard.locator('.add-to-cart').first().click();
  }

  /**
   * Click continue shopping in modal
   */
  async continueShopping(): Promise<void> {
    await this.click(this.continueShoppingButton);
  }

  /**
   * Click view cart in modal
   */
  async viewCart(): Promise<void> {
    await this.click(this.viewCartLink);
  }

  /**
   * Get all product names
   */
  async getAllProductNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.productCards.count();
    for (let i = 0; i < count; i++) {
      const name = await this.productCards.nth(i).locator('.productinfo p').textContent();
      if (name) names.push(name);
    }
    return names;
  }
}
