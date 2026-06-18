# CLAUDE.md — Toolshop Playwright Suite

This file tells Claude Code everything it needs to scaffold, run, debug, and extend this test suite without asking you for context.

---

## Project snapshot

| Item | Value |
|---|---|
| App under test | Practice Software Testing (Toolshop) — https://practicesoftwaretesting.com |
| Language | TypeScript (strict) |
| Framework | Playwright v1.61+ |
| Pattern | Page Object Model — all selectors live in `pages/`, never in `tests/` |
| Locator strategy | **ARIA-first**: `getByRole` → `getByLabel` → `getByPlaceholder` → `getByTestId` as last resort |
| Test-id attribute | `testIdAttribute: 'data-test'` — Toolshop uses `data-test`, not the Playwright default `data-testid` |
| Auth | `storageState` saved to `.auth/customer.json` by the `setup` project |

---

## Repository layout

```
pages/           # One class per page; ARIA-first locators
tests/
  auth/          # login.spec.ts + auth.setup.ts (storageState writer)
  products/      # search, filter, sort
  cart/          # add-to-cart, qty, remove
  checkout/      # billing, payment method field assertions, full order
  e2e/           # multi-item-checkout.spec.ts  ← FEATURED scenario
  negative/      # data-driven invalid login + checkout edge cases
data/            # users, invalid-logins, products, billing/payment fixtures
utils/
  price-utils.ts     # parseCurrency(), round2()
  test-fixtures.ts   # Extends `test` with all page-object fixtures
  helpers.ts, screenshot-helper.ts
config/
  config.ts          # Reads .env; single source of truth for URLs, credentials, timeouts
  global-setup.ts    # Creates output dirs before the run
  global-teardown.ts # Post-run hook
playwright.config.ts
  └── projects:
        setup           → runs auth.setup.ts (creates .auth/customer.json)
        chromium        → authenticated feature tests; depends on setup; ignores login+negative
        chromium-noauth → no saved state; matches auth/login.spec.ts only
        negative        → no saved state; matches negative/**; workers: 1
        smoke           → @smoke-tagged tests; depends on setup (reuses auth); workers: 1
```

> Per-project `workers` is used (Playwright 1.52+). `negative` and `smoke` are capped at 1
> worker because their @smoke/checkout tests share one demo customer account/cart and would
> otherwise contend. The `e2e` and negative-checkout describes also run `mode: 'serial'`.

---

## Running the suite

```bash
# Full suite (all projects)
npm test

# Only the featured multi-item checkout
npm run test:featured

# Smoke project (@smoke tests, auth reused, fast)
npm run test:smoke          # = playwright test --project=smoke
#   override worker count ad-hoc:
npx playwright test --project=smoke --workers=4

# Negative project (invalid login + checkout edge cases)
npm run test:negative       # = playwright test --project=negative

# Headed (visible browser, useful for debugging)
npm run test:headed

# Interactive UI mode
npm run test:ui

# Single file
npx playwright test tests/e2e/multi-item-checkout.spec.ts --project=chromium

# Open last HTML report
npm run report
```

---

## Locator conventions

Always prefer the highest-confidence ARIA locator:

1. `page.getByRole('button', { name: /add to cart/i })` — semantic, resilient
2. `page.getByLabel('Email address')` — tied to the label text
3. `page.getByPlaceholder('Search')` — for unlabelled inputs
4. `page.getByTestId('unit-price')` — only when no accessible alternative exists

Never use `.css-class`, `nth-child`, or absolute XPaths in page objects.

---

## Adding a new test

1. Identify the page(s) involved and open the relevant `pages/` file.
2. If a new locator is needed, add it as a `get` property returning a `Locator`.
3. Add a method to the page object if it encapsulates more than one action.
4. Create the spec in the correct `tests/` subdirectory.
5. Import fixtures from `../../utils/test-fixtures`.
6. Run `npx playwright test path/to/new.spec.ts --project=chromium --headed` to verify.

---

## Adding a new page object

```typescript
// pages/MyPage.ts
import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class MyPage extends BasePage {
  get someButton(): Locator {
    return this.page.getByRole('button', { name: /click me/i });
  }
  async doSomething(): Promise<void> {
    await this.someButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
```

Then register it in `utils/test-fixtures.ts`:
```typescript
myPage: async ({ page }, use) => use(new MyPage(page)),
```

---

## Cart arithmetic rule

The featured scenario reads prices from the DOM — never hardcode them.

```typescript
const rows = await cartPage.getCartData();
for (const row of rows) {
  expect(round2(row.lineTotal)).toBeCloseTo(round2(row.unitPrice * row.quantity), 1);
}
const total = await cartPage.getCartTotal();
expect(round2(total)).toBeCloseTo(round2(rows.reduce((s, r) => s + r.lineTotal, 0)), 1);
```

---

## Common debugging steps

| Problem | Fix |
|---|---|
| `storageState` login fails | Delete `.auth/customer.json` and re-run `npx playwright test --project=setup` |
| Locator not found | Open `--headed --debug`, inspect element, update the page object getter |
| `getByTestId` times out | Confirm `testIdAttribute: 'data-test'` is set — Toolshop uses `data-test`, not `data-testid` |
| Country select won't pick a value | Select by **value** (`'US'`), not label — the option label is "United States of America (the)" |
| Bank-transfer / billing fields not found | Toolshop uses underscores in `data-test`: `bank_name`, `account_name`, `account_number`, `postal_code`, `house_number` |
| Confirm/Proceed button click hangs | Those buttons are **disabled** until the form is valid — assert `toBeDisabled()` for negative cases instead of clicking |
| Login error not detected | The error element is `data-test="login-error"` (a `<div>` with no `role="alert"`) |
| Checkout step won't advance | The 4 accordion steps share the label "Proceed to checkout" — target `proceed-1/2/3` by `data-test`, not by name |
| Auth test proceeds before login finishes | Wait on `postLoginHeading` ("My account"), not a generic nav button |
| Flaky qty-change test | `CartPage.setQuantityForRow` waits on the `/carts` API response (waits are best-effort for rejected qty 0/negative) |
| Flaky checkout under parallel load | Shared demo cart contends across workers — keep `negative`/`smoke` at `workers: 1` and e2e `mode: 'serial'` |

---

## What to automate next

- Admin flows: create/edit product, view orders dashboard
- Account registration with unique email (`${Date.now()}@test.com`)
- Wishlist add/remove
- Search pagination
- Responsive/mobile viewport tests
