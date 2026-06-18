import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class HomePage extends BasePage {
  // ── ARIA-first locators ────────────────────────────────────────────────────
  get searchInput(): Locator {
    // Toolshop uses a search input with placeholder "Search"
    return this.page.getByPlaceholder(/search/i);
  }
  get searchButton(): Locator {
    return this.page.getByRole('button', { name: /^search$/i });
  }
  get searchResetButton(): Locator {
    // The ✕ button that clears the search field
    return this.page.getByRole('button', { name: /clear|reset/i })
      .or(this.page.getByTestId('search-reset'));
  }
  // Sort dropdown — no accessible label, fall back to data-test
  get sortSelect(): Locator {
    return this.page.getByTestId('sort');
  }
  // All product card links — restrict to <a> elements so we don't accidentally match
  // price tags, images, or quick-action buttons that also have data-test^="product-"
  get productLinks(): Locator {
    return this.page.locator('a[data-test^="product-"]');
  }
  // "No results" message
  get noResultsMessage(): Locator {
    return this.page.getByText(/no results found|there are no products/i);
  }

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigateTo('/');
    await this.page.waitForLoadState('networkidle');
    // Ensure the product grid is populated before callers try to read hrefs
    await this.productLinks.first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clearSearch(): Promise<void> {
    await this.searchResetButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async sortBy(optionValue: string): Promise<void> {
    // Register before selectOption so we don't miss the API call that fires synchronously
    const sortedResponse = this.page.waitForResponse(
      r => r.url().includes('/products') && r.request().method() === 'GET' && r.status() === 200,
      { timeout: 15_000 },
    );
    await this.sortSelect.selectOption(optionValue);
    await sortedResponse;
    // Allow Angular one tick to update the DOM after the API response
    await this.page.waitForLoadState('networkidle');
  }

  async filterByCategory(categoryLabel: string): Promise<void> {
    // Toolshop filter checkboxes have no id — they're wrapped by <label> elements.
    // Use .first() since partial text can match multiple subcategory labels.
    const filterResponse = this.page.waitForResponse(
      r => r.url().includes('/products') && r.request().method() === 'GET' && r.status() === 200,
      { timeout: 15_000 },
    );
    await this.page.getByLabel(categoryLabel, { exact: false }).first().check();
    await filterResponse;
    await this.page.waitForLoadState('networkidle');
  }

  async getProductNames(): Promise<string[]> {
    // allTextContents() does not wait per-element — safe for large result sets
    const texts = await this.productLinks.allTextContents();
    return texts.map(t => t.trim()).filter(Boolean);
  }

  async clickProductByIndex(index: number): Promise<void> {
    const card = this.productLinks.nth(index);
    // Read href before clicking so we can pin the waitForFunction to this specific product ID.
    // This prevents false positives if Angular briefly shows a previous product's h1.
    const href = (await card.getAttribute('href')) ?? '';
    const productId = href.split('/product/')[1]?.split('?')[0] ?? '';

    await card.click();

    // waitForFunction polls until the URL contains this product's ID AND the h1 has
    // content — confirming Angular has rendered the product data (from cache or API).
    // waitForLoadState('networkidle') alone races with Angular's async rendering.
    await this.page.waitForFunction(
      (id) => {
        const url = window.location.href;
        if (!url.includes('/product/')) return false;
        if (id && !url.includes(id)) return false;
        const h1 = document.querySelector('h1') as HTMLElement | null;
        return (h1?.textContent?.trim()?.length ?? 0) > 3;
      },
      productId,
      { timeout: 15_000 },
    );
  }

  async clickProductByName(name: string): Promise<void> {
    const link = this.page.getByRole('link', { name, exact: false }).first();
    const href = (await link.getAttribute('href')) ?? '';
    const productId = href.split('/product/')[1]?.split('?')[0] ?? '';

    await link.click();

    await this.page.waitForFunction(
      (id) => {
        const url = window.location.href;
        if (!url.includes('/product/')) return false;
        if (id && !url.includes(id)) return false;
        const h1 = document.querySelector('h1') as HTMLElement | null;
        return (h1?.textContent?.trim()?.length ?? 0) > 3;
      },
      productId,
      { timeout: 15_000 },
    );
  }
}
