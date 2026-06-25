# CLAUDE.md — Web Extraction Job Manager

## Project
Take-home assignment: minimal internal service for managing web extraction jobs.
FastAPI backend, Jinja2 + vanilla JS frontend, in-memory storage, pytest test suite.

## Run
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
# Open http://localhost:8000
```

## Test
```bash
pytest tests/ -v
```

## Layout
```
app/
  main.py           — FastAPI entry; mounts routers, serves Jinja2 UI at /
  models.py         — Pydantic v2 domain models: Account, Job, JobStatus
  storage.py        — Module-level dicts; auto-seeded with one "default" account
  routes/
    jobs.py         — /api/jobs  (POST /, GET /, GET /{id}, POST /{id}/start, POST /{id}/stop)
    accounts.py     — /api/accounts  (POST /, GET /, GET /{id})
templates/
  index.html        — Single-page UI; vanilla JS, no framework, intentionally unstyled
tests/
  conftest.py       — autouse fixture resets storage before each test; TestClient fixture
  test_jobs.py      — state machine, allowance enforcement, HTTP status contracts
  test_accounts.py  — account CRUD, pages_remaining computation
agents/
  test-generator.md    — Prompt template: generate edge-case tests for a route
  coverage-reviewer.md — Prompt template: find coverage gaps in tests vs. implementation
STRATEGY.md         — Testing rationale (candidate's own words for submission)
skills.md           — AI-assisted QE patterns and prompt playbook
```

## Domain Rules
- **Account** tracks `monthly_allowance` (pages) and `pages_used` this period
- **Job** belongs to one account; `pages_per_run` is set at registration
- **Start**: checks `pages_remaining >= pages_per_run`; deducts if ok; status → `running`
- **Stop**: status → `stopped`; pages already deducted, not refunded
- **Restart**: a stopped job can start again (deducts allowance again)
- Valid transitions: `idle` → `running` → `stopped` → `running`

## HTTP Contracts
| Action                         | Success | Error conditions          |
|-------------------------------|---------|---------------------------|
| POST /api/jobs/                | 201     | 404 (account not found)   |
| POST /api/jobs/{id}/start      | 200     | 404, 409 (already running), 402 (insufficient allowance) |
| POST /api/jobs/{id}/stop       | 200     | 404, 409 (not running)    |
| GET /api/accounts/{id}         | 200     | 404                       |

## Key Assumptions
1. One pre-seeded "default" account; UI always operates against it
2. Starting a job is a synchronous simulated deduction — no async worker or scheduler
3. Monthly allowance does not auto-reset (out of scope)
4. No auth, no persistence beyond process lifetime, no concurrency control

## Risk Areas
- **No concurrency control**: two simultaneous start requests for different jobs on the same
  account can both pass the allowance check before either deducts — double-spend. Fix: DB
  transaction or CAS on `pages_used`.
- **Pages not refunded on stop**: intentional — pages were "consumed" at start time.
- **No URL validation**: `target_url` is stored as-is; Pydantic does not validate URL format.

## Testing Philosophy
Integration over unit. Every test hits real FastAPI routes via `TestClient` with storage reset
per test — no mocking. This catches serialization bugs, routing mistakes, and status-code
regressions that mocks would hide. Coverage spans: state machine transitions, invalid
transitions (409), allowance boundary (402), not-found (404), and the invariant that job
status does NOT mutate when a validation check fails.

## Pydantic v2 Notes
- `Account.pages_remaining` uses `@computed_field` so it appears in JSON responses
- Direct attribute assignment works (`account.pages_used += n`) — models are not frozen by default
- `computed_field` recomputes on each access; no caching

## FastAPI / Tooling Notes
- `Jinja2Templates(directory=...)` path is resolved relative to `app/main.py` using `Path(__file__)`
  so `uvicorn` can be run from any directory
- `TestClient` is from `starlette.testclient`; `httpx` is required as its transport layer
- Route imports (`from ..storage import jobs, accounts`) bind to the dict objects, not copies —
  conftest `.clear()` + repopulate pattern works correctly
