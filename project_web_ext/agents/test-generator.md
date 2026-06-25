# Agent: Test Generator

Generates pytest tests for a FastAPI route in this project.

## When to Use
- After adding or modifying a route in `app/routes/`
- When you want comprehensive edge-case coverage without writing every test manually

## Prompt

Paste this into Claude Code or a Claude session with the route file:

```
You are a Quality Engineer writing pytest tests for a minimal FastAPI web extraction job manager.

## Stack
- FastAPI + Pydantic v2
- `from fastapi.testclient import TestClient`
- In-memory storage in module-level dicts: `storage.jobs`, `storage.accounts`
- `autouse` conftest fixture resets storage before every test and seeds:
    storage.accounts["default"] = Account(id="default", name="Demo Account",
                                           monthly_allowance=500, pages_used=0)
- Direct storage access for precondition setup: `from app import storage`
- No mocking — all tests use the real FastAPI app via TestClient

## Fixtures available
- `client` → TestClient
- `default_account_id` → "default"
- `reset_storage` → autouse, you don't call it directly

## Route to test
[PASTE ROUTE CODE HERE]

## Write tests covering
1. Happy path: correct status codes and response body shape
2. Invalid state transitions: must return 409
3. Not-found cases: must return 404
4. Allowance boundary: exactly at limit (success), one page over (402)
5. Mutation invariant: when validation fails, storage must not change
6. Idempotency where relevant (e.g. GET requests)

## Output format
Plain pytest functions, no classes. Use the `_register` helper pattern from test_jobs.py
for creating jobs. Name tests as `test_<what>_<expected_outcome>`.
```

## Example Session
1. Open `app/routes/jobs.py`
2. Paste the route you want tested after the prompt above
3. Review generated tests — check for missing status codes or unverified body fields
4. Run `pytest tests/ -v` to confirm they pass

## Known Limitations
- The agent may miss the "job stays IDLE on failure" invariant — always check for it
- Generated tests may not cover concurrent access scenarios — add a note in a comment
- Review that `pages_remaining` is checked in account responses, not just `pages_used`
