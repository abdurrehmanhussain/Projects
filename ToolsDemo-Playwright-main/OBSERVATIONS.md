# OBSERVATIONS.md — Toolshop Defects & Risk Notes

Captured during automation of https://practicesoftwaretesting.com.

---

## OBS-001 · Shared demo data resets unpredictably

**Type:** Testability / Environment Risk  
**Severity:** High (automation stability)

**Observation:**  
The Toolshop is a shared public demo. Other users can modify or delete data between runs. Product names, IDs, and order history are not stable across sessions.

**Steps to reproduce:**  
1. Run the suite.  
2. Another user removes a product or changes a price.  
3. Re-run the suite — tests that relied on the first product having a specific name fail.

**Why it matters:**  
Hard-coded product IDs or prices produce brittle tests. The suite addresses this by:
- Using `productLinks.nth(0)` / `nth(1)` rather than fixed IDs
- Reading all prices from the DOM at runtime (`parseCurrency`)
- Never asserting specific dollar amounts

**Recommendation:**  
In a production environment, seed a dedicated test database before each run.

---

## OBS-002 · Quantity update requires blur/Tab — no "Update" button

**Type:** UX / Testability  
**Severity:** Low  
**Steps to reproduce:**  
1. Go to the cart.  
2. Change the qty input to a new value.  
3. Do NOT press Tab or click elsewhere.  
4. The line total does not update.

**Why it matters:**  
Tests that fill the qty input and immediately read the total will see stale data. `CartPage.setQuantityForRow` mitigates this by pressing `Tab` to blur **and** awaiting the `/carts` update response (`waitForResponse`) before reading the re-rendered total — far more reliable than the blur alone. A dedicated, accessible "Update" affordance would still be better UX than relying on blur.

---

## OBS-003 · No confirmation before removing a cart item

**Type:** UX / Defect candidate  
**Severity:** Medium  
**Steps to reproduce:**  
1. Add a product to cart.  
2. Click the delete (trash) icon.  
3. Item is removed immediately with no undo.

**Why it matters:**  
Accidental taps (especially on mobile) cause irreversible cart loss. Industry standard is an undo toast or a confirmation dialog. This also makes the `removeRow` test deterministic only when there is exactly one delete button on screen.

---

## OBS-004 · Setting quantity to 0 has undefined behaviour

**Type:** Validation Gap  
**Severity:** Medium  
**Steps to reproduce:**  
1. Add a product to cart.  
2. Set the qty input to `0`.  
3. Press Tab.

**Observed:** Behaviour varies — the app may silently reset to 1, remove the item, or leave the total inconsistent.

**Why it matters:**  
The cart arithmetic invariant (`line_total = price × qty`) breaks when qty=0 yields a non-zero line total. A clear validation rule ("qty must be ≥ 1") with a visible error message is needed. Negative quantities behave similarly.

---

## OBS-005 · Validation blocks by disabling the button, with no inline error text

**Type:** Validation Gap / Accessibility  
**Severity:** Medium  
**Steps to reproduce:**  
1. Log in, add a product to cart, proceed to checkout.  
2. On the **billing** step, leave fields empty — the "Proceed to checkout" (`proceed-3`) button stays `disabled`.  
3. On the **payment** step, select nothing — the "Confirm" (`finish`) button stays `disabled`.

**Observed:** The app prevents progress purely by disabling the action button; there are no per-field inline messages telling the user what is missing.

**Why it matters:**  
A disabled button with no explanation is a known accessibility/UX anti-pattern — screen-reader and keyboard users get no feedback on *why* they're stuck. Per-field inline errors ("Postal code is required") are the WCAG 3.3.1 standard. (The suite's negative tests assert `toBeDisabled()` to match this behaviour rather than clicking.)

---

## OBS-006 · Payment method select has no accessible label

**Type:** Accessibility / Testability  
**Severity:** Low  
**Steps to reproduce:**  
1. Proceed to payment step.  
2. Inspect the `<select>` element.  
3. It has no `<label>` or `aria-label` attribute.

**Why it matters:**  
Screen-reader users cannot identify the field. It also forces the test suite to use `getByTestId('payment-method')` instead of the preferred `getByLabel()`. Adding `<label for="payment-method">Payment Method</label>` fixes both issues.

---

## OBS-007 · No CSRF protection observable on login form

**Type:** Security Observation  
**Severity:** Note only (practice app)  
**Observation:**  
The login form does not include a CSRF token in the request. For a practice/demo app this is acceptable. For production, every state-changing POST should include a server-validated CSRF token.

---

## OBS-008 · SQL injection string accepted by email field without error

**Type:** Security / Input Validation  
**Severity:** Note (practice app)  
**Steps to reproduce:**  
1. Go to login.  
2. Enter `' OR '1'='1` as the email.  
3. The server returns "Invalid email or password" rather than rejecting it at the client.

**Why it matters:**  
Client-side email format validation would catch this before it reaches the server. The back-end appears to handle it safely (no injection succeeded), but front-end format validation (`type="email"` + pattern check) is a defence-in-depth layer worth adding.

---

## OBS-009 · Checkout accordion steps share an identical button label

**Type:** Accessibility / Testability  
**Severity:** Medium  
**Steps to reproduce:**  
1. Proceed through checkout (Cart → Sign in → Billing → Payment).  
2. Inspect the step buttons: `proceed-1`, `proceed-2`, and `proceed-3` all read **"Proceed to checkout"**.

**Why it matters:**  
Three buttons with the same accessible name are ambiguous for screen-reader users and break `getByRole('button', { name: 'Proceed to checkout' })` (strict-mode match of multiple elements). Distinct labels ("Continue to sign in", "Continue to billing", "Continue to payment") would fix both. The suite works around it by targeting `data-test` ids.

---

## OBS-010 · Login error is not exposed as an alert role

**Type:** Accessibility  
**Severity:** Low–Medium  
**Steps to reproduce:**  
1. Submit invalid credentials.  
2. Inspect the "Invalid email or password" message — it's a `<div data-test="login-error">` with no `role="alert"` / `aria-live`.

**Why it matters:**  
Without `role="alert"` (or an `aria-live` region), assistive tech does not announce the error when it appears, so screen-reader users may not realise the login failed. Adding `role="alert"` is a one-line accessibility fix.

---

## OBS-011 · Country dropdown is keyed by ISO code, label is verbose

**Type:** Testability  
**Severity:** Low  
**Observation:**  
The billing country `<select>` options use ISO values (`US`, `GB`, …) with verbose labels such as "United States of America (the)". Selecting by a friendly label like "United States" fails.

**Why it matters:**  
Automation (and any integration keyed on a human-readable name) must select by `value`. Documenting the value list, or exposing a stable label, reduces brittleness. The suite selects country by `value`.

---

## OBS-012 · Inconsistent `data-test` naming (hyphens vs underscores)

**Type:** Testability  
**Severity:** Low  
**Observation:**  
`data-test` ids mix conventions: step buttons use hyphens (`proceed-1`, `bank-transfer`) while form fields use underscores (`bank_name`, `account_name`, `account_number`, `postal_code`, `house_number`). Also the app uses `data-test`, not the more common `data-testid`.

**Why it matters:**  
Mixed conventions cause silent locator misses. A single consistent scheme (and ideally the conventional `data-testid`) would make the app more automation-friendly.

---

## OBS-013 · Single shared cart per account causes cross-test contention

**Type:** Testability / Environment Risk  
**Severity:** Medium (automation stability)  
**Observation:**  
The cart is server-side per customer account. With all authenticated tests using the one demo account, parallel workers manipulate the same cart and corrupt each other's state (empty cart mid-checkout, wrong row counts).

**Why it matters:**  
Forces `workers: 1` on the `negative`/`smoke` projects and `mode: 'serial'` on e2e/negative-checkout, limiting parallelism. Per-test isolated accounts (or a seeded DB) would allow full parallel execution.
