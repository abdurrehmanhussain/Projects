# /add-test

Scaffold a new Playwright test for the Toolshop suite.

## Usage

```
/add-test <description of what to test>
```

Example:
```
/add-test user can add a product to a wishlist
/add-test search results are paginated correctly
/add-test admin can create a new product
```

## What to do

1. **Identify the right test file location** based on the feature area:
   - Auth → `tests/auth/`
   - Products / search / filter → `tests/products/`
   - Cart → `tests/cart/`
   - Checkout → `tests/checkout/`
   - End-to-end flows → `tests/e2e/`
   - Error cases / edge cases → `tests/negative/`

2. **Check existing page objects** in `pages/` — use existing locators and methods.
   If a new locator is needed, add it to the relevant page object as a `get` property.

3. **Write the test** using `test` and `expect` imported from `../../utils/test-fixtures`.
   - Use ARIA-first locators: `getByRole` → `getByLabel` → `getByPlaceholder` → `getByTestId`
   - For auth-required tests use the `chromium` project (storageState is pre-loaded)
   - For no-auth tests (login, negative) target `chromium-noauth`

4. **Run the new test** to verify it passes:
   ```
   npx playwright test <path-to-new-file> --project=chromium --headed
   ```

5. **Report** the file created, what it tests, and any locators added to page objects.

## Locator convention reminder

```typescript
// ✅ Good — ARIA-first
this.page.getByRole('button', { name: /add to cart/i })
this.page.getByLabel('Email address')
this.page.getByPlaceholder('Search')

// ✅ Acceptable fallback — stable data-test attribute
this.page.getByTestId('unit-price')

// ❌ Avoid — brittle
this.page.locator('.btn.btn-primary:nth-child(2)')
this.page.locator('//div[@class="card"]/button')
```
