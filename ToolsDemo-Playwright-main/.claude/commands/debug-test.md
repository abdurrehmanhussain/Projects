# /debug-test

Diagnose and fix a failing Playwright test in the Toolshop suite.

## Usage

```
/debug-test <test name or file path>
```

Example:
```
/debug-test "full multi-item checkout with verified cart arithmetic"
/debug-test tests/e2e/multi-item-checkout.spec.ts
```

## What to do

1. **Read the failure output** — identify the assertion that failed and the line number.

2. **Check whether it's a locator issue or a logic issue**:
   - Locator timeout → the element wasn't found. Open the page with `--headed --debug` and inspect.
   - Assertion value mismatch → the value was found but wrong. Log the actual value.
   - Test setup failure → a `beforeEach` step failed (e.g. cart empty, not logged in).

3. **Common fixes for this suite**:

   | Symptom | Likely cause | Fix |
   |---|---|---|
   | `getByRole('button', { name: /login/i })` times out | Button text changed | Update the regex in `LoginPage.ts` |
   | `storageState` login expired | `.auth/customer.json` stale | Delete file, rerun `npx playwright test --project=setup` |
   | Cart total assertion fails | Qty update didn't trigger recalc | Add `await page.waitForResponse(...)` after qty change |
   | `proceedToCheckout` times out | Button text differs | Inspect live and update `CheckoutPage.proceedBillingButton` |
   | `networkidle` timeout on slow CI | Network too slow | Switch to `domcontentloaded` in the affected `goto()` |

4. **Run in debug mode** to pause at the failure:
   ```
   npx playwright test <file> --project=chromium --debug
   ```

5. **After fixing**, run the full suite to check for regressions:
   ```
   npm test
   ```

6. **Report** what changed, why, and whether any page-object locators were updated.

## Selector inspection workflow

1. `npx playwright codegen https://practicesoftwaretesting.com` — open the app and hover/click elements; Codegen shows the best locator Playwright can find.
2. Cross-check the generated locator against the ARIA-first hierarchy in CLAUDE.md.
3. Update the page object getter — never patch the selector inside the test file.
