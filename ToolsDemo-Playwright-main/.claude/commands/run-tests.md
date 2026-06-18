# /run-tests

Run the Toolshop Playwright suite (or a subset of it).

## Usage

```
/run-tests                   → full suite
/run-tests featured          → multi-item checkout only
/run-tests smoke             → @smoke tagged tests
/run-tests auth              → login tests (no-auth project)
/run-tests negative          → all negative cases
/run-tests products          → product discovery tests
/run-tests cart              → cart tests
/run-tests checkout          → checkout flow tests
/run-tests headed            → full suite, visible browser
```

## What to do

When the user runs `/run-tests [subset]`, map the argument to the correct npm script or playwright CLI command:

| Argument | Command |
|---|---|
| (none) | `npm test` |
| `featured` | `npm run test:featured` |
| `smoke` | `npx playwright test --grep @smoke --project=chromium` |
| `auth` | `npm run test:auth` |
| `negative` | `npm run test:negative` |
| `products` | `npm run test:products` |
| `cart` | `npm run test:cart` |
| `checkout` | `npm run test:checkout` |
| `headed` | `npm run test:headed` |

After running, parse the output and report:
- How many tests passed / failed / skipped
- For failures: the test name, the assertion that failed, and the file/line
- Suggest the next debugging step (e.g. "run with --headed to watch the failure")

## Working directory

All commands must run from `c:/BPlanner/BP-Playwright-main`
