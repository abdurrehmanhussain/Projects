# STRATEGY.md

## Testing Approach

I prioritized integration tests over unit tests because the core risk in this service is not
algorithmic complexity — it's the HTTP contract and state transitions between jobs and accounts.

The key decision: **no mocking**. Every test hits the real FastAPI application through `TestClient`
with in-memory storage reset before each test. Mocks would let me test my mocks, not the actual
behavior. A mocked start_job that always passes the allowance check would never catch a bug where
the 402 path also mutates state.

I organized tests around three axes:
1. **State machine correctness** — idle → running → stopped transitions, and invalid transitions
   that must return 409 (start a running job, stop an idle or stopped job)
2. **Allowance enforcement** — deduction on start, rejection when exhausted, and critically: the
   job stays IDLE when allowance fails (no partial mutation)
3. **HTTP contract** — correct status codes (201, 409, 402, 404) for each outcome, not just
   "it returned something"

## Domain Inspiration

The page allowance concept is modeled after how real extraction platforms like **Zyte** (formerly
Scrapy Cloud) meter usage — each account gets a monthly page quota, every crawl job draws from it,
and a job cannot start if the quota is exhausted. This shaped two design decisions:

1. Pages are deducted **at start time**, not at stop — because in a real scraper the pages are
   fetched the moment the job runs, not when you stop it.
2. The 402 status code for insufficient allowance mirrors how billing-aware APIs signal quota
   exhaustion — distinct from a 403 (forbidden) or 400 (bad request).

## Riskiest Part

The allowance check-then-deduct is not atomic. Two concurrent `start` requests for different jobs
on the same account can both read the same `pages_remaining`, both pass the check, and both deduct
— overspending the allowance. The in-memory dict has no locking.

For production, this needs either a database transaction (read + deduct in one atomic op) or
optimistic locking (compare-and-swap on `pages_used` with a retry loop).

## AI Agent Usage

I used Claude Code to scaffold the FastAPI routes, Pydantic models, storage layer, and test suite.

**Where it got something wrong**: Claude initially defined `pages_remaining` as a plain `@property`
on the Pydantic model without `@computed_field`. Pydantic v2 excludes plain properties from JSON
serialization, so the API response omitted `pages_remaining` entirely — the frontend showed
`undefined`. I caught this by checking the raw API response and traced it to the serialization
layer. The fix was wrapping the property with `@computed_field` from pydantic.

**Where I redirected it**: Claude suggested adding database persistence and JWT authentication as
"production-ready" improvements. I kept it scoped to the assignment — in-memory is fine, and
staying minimal is the point. The most consistent correction was keeping AI on scope.

The tests were solid on the first pass; I added the "job stays IDLE on allowance failure" test
after manually reviewing the route logic and realizing the test suite had the happy-path covered
but not the invariant that failed checks must not produce side effects.
