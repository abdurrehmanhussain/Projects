# PROMPTS.md — AI Session Log

This file records how Claude was directed during the assessment. It is the process log BusPlanner asked for.

---

## Session overview

**Tool:** Claude Code (Sonnet 4.6) in VSCode extension  
**Date:** 2026-06-18  
**Duration:** ~2 hours  
**Starting point:** Skeleton TypeScript/Playwright repo with BasePage, BaseTest, config stub, no tests

---

## Turn 1 — Understand the task

**Prompt to Claude:**
> Read `Automation Task.pdf`, understand the full scope, and ask clarifying questions before building anything.

**What Claude did:**
Read the 4-page PDF. Identified: TypeScript skeleton already present, ARIA-first locator requirement added by user, 6 deliverables (framework, test flows, featured checkout, negative cases, observations, handoff).

**My check:** Confirmed the skeleton uses TypeScript (not plain JS as the ABDUR says) — kept TypeScript as it's better for teams and the skeleton is already set up for it.

---

## Turn 2 — Locator strategy decision

**User correction mid-session:**
> Use best ARIA-locators — fast and reliable in POM

**What changed:**
- Dropped `[data-test="email"]` as the primary strategy
- Replaced with `getByLabel`, `getByRole`, `getByPlaceholder` throughout all page objects
- `getByTestId` kept only as last resort (e.g., unit-price display, sort select with no label)
- Added this rule to `CLAUDE.md` so it persists for future sessions

---

## Turn 3 — Architecture decisions I directed

I guided Claude toward:

1. **`storageState` for auth** — instead of logging in before every test, run `auth.setup.ts` once and reuse the saved cookie/localStorage state. This avoids ~5s of login overhead per test.

2. **Three Playwright projects:**
   - `setup` → writes `.auth/customer.json`
   - `chromium` → authenticated feature tests (depends on setup)
   - `chromium-noauth` → login.spec + negative tests (no state)

3. **`test.extend` fixture pattern** — all six page objects injected via `utils/test-fixtures.ts` so tests declare only what they use.

4. **`parseCurrency` utility** — the PDF explicitly said "do not hard-code amounts." I directed Claude to extract all prices from the DOM and assert the arithmetic at runtime.

**Verified:** Read each generated file before moving on. Checked that no test contained a hardcoded dollar amount.

---

## Turn 4 — Featured scenario review

After Claude wrote `multi-item-checkout.spec.ts` I checked:

- Does it add exactly two different products? ✓ (name guard added)
- Does it change qty and assert `round2(price × qty) ≈ round2(lineTotal)`? ✓
- Does it assert `round2(sum of lineTotals) ≈ round2(cartTotal)`? ✓
- Does it verify payment-specific fields BEFORE completing? ✓ (`areBankTransferFieldsVisible`)
- Does it complete the order and check confirmation? ✓

One issue I spotted: the original draft removed an item by index without checking the row count first. I noted this and Claude added the `if (countAfterQtyChange > 2)` guard to handle state left by other users.

---

## Turn 5 — Negative tests

Directed Claude to:
- Use a `for...of` loop over `INVALID_LOGIN_CASES` (array in `data/invalid-logins.ts`) so cases can be added without touching the spec
- Not assert exact error message text (the demo wording can change); assert with regex or just confirm the page didn't navigate
- Qty edge cases (0, very large, negative): assert the invariant holds or the app corrects gracefully — don't assert a specific error text

---

## Turn 6 — Claude assets

Directed Claude to write:
- `CLAUDE.md` — project instructions for future sessions
- `.claude/commands/run-tests.md` — `/run-tests` slash command
- `.claude/commands/add-test.md` — `/add-test` slash command  
- `.claude/commands/debug-test.md` — `/debug-test` slash command

**Why:** The PDF asked for "reusable AI assets." These commands let any teammate open a new Claude session and immediately have context-aware help.

---

## Turn 7 — Run against the live app & fix every failure

**Prompt to Claude:**
> Run the suite against the live Toolshop, diagnose each failure with screenshots/diagnostic scripts, and fix the page objects. Use best ARIA locators, fast and reliable in POM.

**What Claude did (root causes found by inspecting the live DOM):**
- **`testIdAttribute: 'data-test'`** — Toolshop uses `data-test`, but Playwright defaults to `data-testid`. This single config fix unblocked the cart/checkout `getByTestId` locators.
- **Country select** — `selectOption({ label: 'United States' })` never matched; the real option is `value="US"`, label `"United States of America (the)"`. Switched to selecting by value.
- **Bank-transfer fields** — used hyphens; the live `data-test` ids use underscores (`bank_name`, `account_name`, `account_number`), and `bank_name` is required (kept Confirm disabled).
- **Cart unit price parsed as 0** — a positional `.or(cells.nth(1))` fallback matched the qty cell; removed it and used the confirmed `product-price` / `line-price` ids.
- **Login error** — element is `data-test="login-error"`, not `role="alert"`.
- **`userNavButton` false positive** — matched "Categories" even when logged out, so the negative `beforeEach` proceeded before login finished; switched to waiting on `postLoginHeading`.
- **`proceedToCheckout`** — the 4 accordion steps share the "Proceed to checkout" label; now targets `proceed-1/2/3` by id with explicit waits.
- **Negative validation** — Toolshop *disables* proceed/finish until valid rather than erroring on click; rewrote those tests to assert `toBeDisabled()`. Made `setQuantityForRow` waits best-effort for rejected qty 0/negative.

**Result:** full suite green (e2e featured included); a couple of demo-server-timing flakes pass on retry.

---

## Turn 8 — Add `smoke` and `negative` projects

**Prompt to Claude:**
> Add a fast `--project=smoke` (2-ish workers, auth reused) and a dedicated `--project=negative`.

**What Claude did:**
- Added a **`smoke`** project: `grep: /@smoke/`, `dependencies: ['setup']` (auth once, reused), per-project `workers`.
- Added a **`negative`** project matching `negative/**`; trimmed `chromium-noauth` to only `login.spec.ts` so negatives don't run twice.
- Wired `test:smoke` → `--project=smoke` and `test:negative` → `--project=negative` in package.json.
- Because @smoke/checkout tests share one demo cart, capped these projects at `workers: 1` and kept e2e/negative-checkout `mode: 'serial'`.

---

## Turn 9 — Project hygiene

**Prompts to Claude:** *"remove error"*, *"global setup/teardown into a folder"*, *"debug scripts → delete"*

**What Claude did:**
- **tsconfig.json** — removed TS 7.0 deprecations: `moduleResolution: "node"` → `"bundler"` (with `module: "esnext"`), removed unused `baseUrl`/`paths` (`@/*` alias was never imported).
- **package.json** — bumped `@playwright/test` `^1.40.0` → `^1.61.0` to match the per-project `workers` feature actually used.
- Moved `global-setup.ts` / `global-teardown.ts` into `config/` and updated the config paths.
- Deleted three one-off debug scripts (`debug-filter/hrefs/pages.mjs`).

---

## Lessons / things I would change

Several earlier-noted risks were resolved this session:

- ✅ `setQuantityForRow` now waits on the `/carts` API response (no longer relies solely on a Tab blur); best-effort for rejected quantities.
- ✅ Post-action waits use `waitForResponse` on the specific cart/products endpoint where `networkidle` was racy.
- ✅ `fillBillingAddress` selects country by **value**, not a label that could drift.

Still open:
- The suite runs against a shared public demo, so per-account cart contention forces `workers: 1` on some projects — a seeded private environment would let everything run fully parallel.
- Confirmation-page assertion relies on heading/alert text patterns; a stable `data-test` on the success view would be more robust.
