# Toolshop Playwright Suite

Playwright + TypeScript end-to-end automation for [Practice Software Testing (Toolshop)](https://practicesoftwaretesting.com).

Built as a BusPlanner QA Engineer technical assessment.

---

## Quick start

```bash
# 1. Go into the project folder
cd ToolsDemo-Playwright-main

# 2. Install dependencies (includes @playwright/test)
npm install

# 3. Install the Playwright browsers
npx playwright install        # or: npm run install:browsers

# 4. Copy and review env (credentials are public demo values)
cp .env.example .env

# 5. Run the full suite
npm test
```

### Run a specific project

```bash
# Smoke tests (fast; @smoke-tagged, auth reused)
npx playwright test --project=smoke

# Negative tests (invalid login + checkout edge cases)
npx playwright test --project=negative

# Featured multi-item checkout (e2e)
npx playwright test --project=chromium tests/e2e/multi-item-checkout.spec.ts
```

### Reports

After any run, the HTML report is written to **`reports/html/`**. Open it with:

```bash
npm run report                # opens reports/html in a browser
# or directly:
npx playwright show-report reports/html
```

Other artifacts: failure screenshots/videos/traces in **`test-results/`**, Allure raw data in **`allure-results/`**.

---

## Folder structure

Each line: `path` ← what it contains.

```
pages/                              ← Page Object Model (ARIA-first locators, one class per page)
  LoginPage.ts                      ← Login form locators + login(), error-alert (data-test="login-error")
  HomePage.ts                       ← Product grid, search, sort, category filter, product navigation
  ProductPage.ts                    ← Product detail: qty, add-to-cart (waits on /carts POST), cart badge
  CartPage.ts                       ← Cart rows, qty change (waits on /carts API), remove, totals, proceed-to-checkout
  CheckoutPage.ts                   ← Billing (country by value, postal_code, house_number) + payment fields
  ConfirmationPage.ts               ← Order-confirmation detection + text
tests/
  auth/
    auth.setup.ts                   ← Logs in once, saves .auth/customer.json (setup project)
    login.spec.ts                   ← Valid + invalid sign-in (chromium-noauth project)
  products/
    products.spec.ts                ← Search, filter, sort, product detail
  cart/
    cart.spec.ts                    ← Add to cart, qty change, remove, nav badge
  checkout/
    checkout.spec.ts                ← Billing → payment field assertions → complete order
  e2e/
    multi-item-checkout.spec.ts     ← FEATURED: verified cart arithmetic, serial mode
  negative/
    login.negative.spec.ts          ← Data-driven invalid credentials
    checkout.negative.spec.ts       ← Disabled-button validation + qty edge cases, serial mode
data/
  users.ts                          ← Customer/admin credentials (from config)
  invalid-logins.ts                 ← INVALID_LOGIN_CASES for data-driven negative login
  products.ts                       ← Categories, sort options, billing address, bank-payment fixtures
config/
  config.ts                         ← Reads .env; single source of truth for URLs, creds, timeouts
  global-setup.ts                   ← Creates output dirs before the run
  global-teardown.ts                ← Post-run hook
utils/
  test-fixtures.ts                  ← Extends `test` with all page-object fixtures
  price-utils.ts                    ← parseCurrency(), round2()
  helpers.ts, screenshot-helper.ts  ← Misc shared helpers
base/
  BasePage.ts                       ← Shared page helpers (navigate, waitFor, etc.)
  BaseTest.ts                       ← Base test scaffolding
playwright.config.ts                ← 5 projects, testIdAttribute: 'data-test', reporters, timeouts
tsconfig.json                       ← TS strict; module esnext / moduleResolution bundler
package.json                        ← Scripts + deps (@playwright/test ^1.61.0)
.claude/commands/                   ← Claude slash commands: /run-tests, /add-test, /debug-test
CLAUDE.md                           ← Instructions for Claude to maintain this suite
HANDOFF.md                          ← Teammate onboarding guide
OBSERVATIONS.md                     ← Defects and risk notes found during automation
PROMPTS.md                          ← Session log of AI-directed prompts
reports/html/                       ← HTML report output (open with `npm run report`)
test-results/                       ← Failure screenshots, videos, traces
.auth/customer.json                 ← Saved login state (written by the setup project)
```

---

## Running tests

| Command | What it runs |
|---|---|
| `npm test` | Full suite (all projects) |
| `npm run test:featured` | Featured multi-item checkout only |
| `npm run test:headed` | Full suite with visible browser |
| `npm run test:ui` | Playwright UI mode (interactive) |
| `npm run test:smoke` | `smoke` project — `@smoke` tests, auth reused (`--project=smoke`) |
| `npm run test:negative` | `negative` project — invalid login + checkout edge cases (`--project=negative`) |
| `npm run test:auth` | Login tests |
| `npm run test:products` | Product discovery tests |
| `npm run test:cart` | Cart tests |
| `npm run test:checkout` | Checkout flow tests |
| `npm run test:debug` | Debug mode (pauses on breakpoints) |
| `npm run report` | Open last HTML report (`reports/html/`) |

### Running a project directly

```bash
npx playwright test --project=smoke         # fast smoke run
npx playwright test --project=negative      # negative / edge cases
npx playwright test --project=chromium      # authenticated feature tests
npx playwright test --project=smoke --workers=4   # override worker count
```

### Re-generating auth state

If login fails with a `storageState` error, regenerate:

```bash
npx playwright test --project=setup
```

---

## Playwright projects

| Project | Auth | Workers | Matches |
|---|---|---|---|
| `setup` | none | — | `tests/auth/auth.setup.ts` (writes `.auth/customer.json`) |
| `chromium` | `.auth/customer.json` | default | Feature tests (excludes login + negative) |
| `chromium-noauth` | none | default | `tests/auth/login.spec.ts` |
| `negative` | none (signs in via UI) | 1 | `tests/negative/**` |
| `smoke` | `.auth/customer.json` (depends on `setup`) | 1 | `@smoke`-tagged tests (excludes login + negative) |

> Per-project `workers` requires Playwright 1.52+ (this suite is on `^1.61.0`). `negative` and `smoke`
> are capped at 1 worker because their tests share a single demo customer account/cart and would
> otherwise contend; e2e and negative-checkout also run `mode: 'serial'`.

---

## Environment variables

Copy `.env.example` to `.env`. All values are pre-filled for the public demo.

| Variable | Default | Purpose |
|---|---|---|
| `BASE_URL` | `https://practicesoftwaretesting.com` | App under test |
| `CUSTOMER_EMAIL` | `customer@...` | Customer login |
| `CUSTOMER_PASSWORD` | `welcome01` | Customer password |
| `ADMIN_EMAIL` | `admin@...` | Admin login |
| `ADMIN_PASSWORD` | `welcome01` | Admin password |
| `BROWSER` | `chromium` | Default browser |
| `HEADLESS` | `true` | Set `false` to watch |

---

## Locator strategy

All locators live in `pages/`. The priority order:

1. `getByRole()` — ARIA semantic role + accessible name
2. `getByLabel()` — form field labels
3. `getByPlaceholder()` — unlabelled inputs
4. `getByTestId()` — `data-test` attribute (last resort)

No CSS class selectors or XPaths in page objects.

---

## Featured scenario

`tests/e2e/multi-item-checkout.spec.ts` verifies:

- Add 2 different products from their detail pages
- Change qty of one item; remove excess items
- **Cart arithmetic** read from the DOM — no hardcoded amounts:
  - `line_total == unit_price × quantity` for each row
  - `cart_total == sum(line_totals)`
- Payment method selection triggers correct field set
- Order completes with a confirmation message

---

## Troubleshooting

**`storageState` not found**
```bash
npx playwright test --project=setup
```

**Locator not found in headed run**
```bash
npx playwright test <file> --headed --debug
# Then use Playwright Inspector to find the correct selector
npx playwright codegen https://practicesoftwaretesting.com
```

**Tests slow on first run**
The Toolshop is a live public site — occasional latency is normal. Retries are set to 1 locally and 2 on CI.
