# skills.md — AI-Assisted QE Patterns

This playbook covers prompts and patterns for using Claude Code effectively on this project.
Each section targets a specific QE task.

---

## Test Generation

Use when adding a new route or new business rule.

```
You are a Quality Engineer writing pytest tests for a FastAPI service.

Context:
- FastAPI with Pydantic v2
- TestClient from starlette.testclient (httpx transport)
- autouse conftest fixture clears storage.jobs and storage.accounts, then re-seeds:
    storage.accounts["default"] = Account(id="default", name="Demo Account",
                                           monthly_allowance=500, pages_used=0)
- Direct storage access for setup: `from app import storage`
- Do not mock anything

Route to test:
[paste route code]

Write tests covering:
1. Happy path (expected 200 / 201)
2. Invalid state transitions (expect 409)
3. Not-found cases (expect 404)
4. Allowance boundary: exact limit, one over (expect 402)
5. Invariant: no state mutation occurs when any validation check fails
```

---

## Coverage Gap Analysis

Use after writing initial tests to find untested branches.

```
You are a senior QE auditing test coverage for a FastAPI service.

Route implementation:
[paste route file]

Current tests:
[paste test file]

For each route handler:
1. List every branch: if/else, HTTPException raise, early return
2. Mark each COVERED or NOT COVERED
3. For each NOT COVERED branch, write the missing pytest test

Also verify:
- Is every HTTP status code tested (200, 201, 402, 404, 409)?
- Is the response body shape checked, not just the status code?
- Are mutation side effects pinned (e.g. pages_used unchanged on failure)?
```

---

## State Machine Audit

Use when adding a new job state or transition.

```
Current state machine: idle → running → stopped → running (restart).
I am adding state [X] triggered by [Y].

List:
1. All valid transitions involving [X]
2. All invalid transitions involving [X] (should return 409)
3. Write a pytest test for each invalid transition verifying 409 and no state mutation
```

---

## Regression Guard

Use before merging any change that touches routes or models.

```
Existing tests:
[paste test files]

Diff being merged:
[paste git diff]

Answer:
1. Which existing tests might fail due to this change?
2. What new tests are needed to cover changed behavior?
3. Have any HTTP status codes or response body fields changed?
4. Is there any mutation that was safe before but unsafe after?
```

---

## Allowance Edge Case Generator

Use when the allowance logic changes.

```
The start_job route checks: account.pages_remaining >= job.pages_per_run
Then deducts: account.pages_used += job.pages_per_run

Generate test cases for:
- pages_remaining == pages_per_run (exact boundary, should succeed)
- pages_remaining == pages_per_run - 1 (one under, should fail with 402)
- pages_remaining == 0 (exhausted)
- pages_remaining > monthly_allowance (overflow guard: pages_remaining floors at 0)
- Multiple jobs starting concurrently draining the same account (describe the race, don't test it)
```

---

## STRATEGY.md Scaffold

Use to draft the submission writeup.

```
I built a FastAPI web extraction job manager. Key facts:
- Stack: [describe]
- Testing approach: [describe]
- Riskiest design decision: [describe]
- AI mistake I caught: [describe]

Write a 200-word STRATEGY.md in first person covering:
1. Testing approach and one decision behind it
2. Where the build is riskiest
3. How I used AI, including one place it got something wrong and what I did
Keep it specific and concrete — no generic QE platitudes.
```

---

## Useful Slash Commands (Claude Code)

| Command            | When to use                                            |
|--------------------|--------------------------------------------------------|
| `/code-review`     | Review current diff for correctness bugs               |
| `/security-review` | Check for OWASP issues in routes (injection, headers)  |
| `/verify`          | Run app and confirm a feature works end-to-end         |
| `/simplify`        | Clean up changed code after a feature lands            |
