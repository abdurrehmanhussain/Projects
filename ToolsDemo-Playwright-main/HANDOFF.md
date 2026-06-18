# HANDOFF.md — How a Teammate Picks This Up

This document tells you (or Claude) how to maintain and extend the Toolshop Playwright suite.

---

## Where things live

| What | Where |
|---|---|
| All page selectors | `pages/<PageName>.ts` — never in test files |
| Test data (credentials, addresses, products) | `data/` |
| Shared `test` fixture (page objects injected) | `utils/test-fixtures.ts` |
| Currency parsing utility | `utils/price-utils.ts` |
| App URL and timeouts | `config/config.ts` (reads `.env`) |
| Global setup / teardown | `config/global-setup.ts`, `config/global-teardown.ts` |
| Playwright projects / reporters | `playwright.config.ts` |
| Claude instructions | `CLAUDE.md` |
| Slash commands for Claude | `.claude/commands/` |

---

## Running the suite from scratch

```bash
git clone <repo>
cd ToolsDemo-Playwright-main
npm install
npm run install:browsers
cp .env.example .env        # credentials already filled for public demo
npm test
npm run report
```

### Useful project-scoped runs

```bash
npm run test:featured   # featured multi-item checkout (e2e)
npm run test:smoke      # @smoke tests, auth reused (project=smoke)
npm run test:negative   # invalid login + checkout edge cases (project=negative)
npm run test:cart       # / test:products / test:checkout / test:e2e / test:auth
```

---

## Adding a new test — 4-step recipe

1. **Open the right spec file** (or create one in the correct `tests/` subdirectory).
2. **Check `pages/`** — if the locator you need already exists, use it. If not, add a `get` getter to the relevant page object.
3. **Write the test** importing from `../../utils/test-fixtures`:
   ```typescript
   import { test, expect } from '../../utils/test-fixtures';
   test('my new test', async ({ homePage, cartPage }) => { ... });
   ```
4. **Verify locally**: `npx playwright test <file> --project=chromium --headed`

Use `/add-test` Claude command to scaffold the boilerplate.

---

## Adding a new page object

```typescript
// pages/WishlistPage.ts
import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class WishlistPage extends BasePage {
  get addToWishlistButton(): Locator {
    return this.page.getByRole('button', { name: /add to wishlist/i });
  }
  async addCurrentProductToWishlist(): Promise<void> {
    await this.addToWishlistButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
```

Then register in `utils/test-fixtures.ts`:
```typescript
wishlistPage: async ({ page }, use) => use(new WishlistPage(page)),
```

---

## Directing Claude to maintain the suite

Claude reads `CLAUDE.md` automatically in this project. To direct it:

- `/run-tests featured` — runs the featured checkout scenario
- `/add-test <what to test>` — scaffolds a new spec + page object additions
- `/debug-test <test name>` — diagnoses and fixes a failing test

When extending live in a review session:
1. Describe the new scenario in plain language.
2. Claude will check `pages/` for existing locators, add new ones if needed, write the spec, and run it.

---

## Regenerating auth state

The `setup` project saves a logged-in browser state to `.auth/customer.json`. If tests fail with auth errors:

```bash
npx playwright test --project=setup
```

This re-runs the login flow and overwrites the state file.

---

## What to automate next (priority order)

1. **Admin product management** — create/edit/delete a product, verify it appears on the storefront
2. **Account registration** — register with a unique email, verify welcome email / confirmation
3. **Wishlist** — add product, persist across sessions, remove
4. **Search pagination** — navigate multiple result pages, verify counts
5. **Order history** — place order, check it appears in account → orders
6. **Mobile viewport** — re-run key flows at 375×812 to catch responsive regressions

---

## CI integration notes

Set these environment variables in your CI pipeline:

```
BASE_URL=https://practicesoftwaretesting.com
CUSTOMER_EMAIL=customer@practicesoftwaretesting.com
CUSTOMER_PASSWORD=welcome01
HEADLESS=true
```

The config already reads `process.env.CI` to:
- Forbid `test.only`
- Set `retries: 2` (locally `retries: 1` to absorb demo-server flakiness)
- Limit total `workers: 2`

Note: the `negative` and `smoke` projects pin **per-project `workers: 1`** (Playwright 1.52+) because
their tests share one demo customer account/cart and contend if run in parallel. `@playwright/test`
is on `^1.61.0` so per-project workers is available.

HTML reports are written to `reports/html/`. Attach the directory as a CI artifact.
