# Web Extraction Job Manager

A minimal internal service for managing web extraction jobs.
Operators can register a job, see the list, and start or stop one.
Each job draws against a monthly page allowance for the account.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | [FastAPI](https://fastapi.tiangolo.com/) |
| Data validation | [Pydantic v2](https://docs.pydantic.dev/latest/) |
| Server | [Uvicorn](https://www.uvicorn.org/) |
| Frontend | Vanilla JS + Jinja2 templates |
| Storage | In-memory (Python dicts, no database) |
| Testing | pytest + httpx |

---

## Run the App

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open in browser: `http://localhost:8000`

Interactive API docs: `http://localhost:8000/docs`

---

## Run Tests

```bash
# run all tests
pytest tests/ -v

# run only account tests
pytest tests/test_accounts.py -v

# run only job tests
pytest tests/test_jobs.py -v

# run one specific test by name
pytest tests/test_jobs.py::test_full_lifecycle -v

# short output (no detail, just pass/fail count)
pytest tests/
```

---

## Project Structure

```
app/
  main.py           — FastAPI entry point
  models.py         — Pydantic models (Account, Job, JobStatus)
  storage.py        — In-memory storage, seeded with demo accounts
  routes/
    jobs.py         — /api/jobs endpoints
    accounts.py     — /api/accounts endpoints
templates/
  index.html        — Single-page UI (vanilla JS, unstyled)
tests/
  conftest.py       — Fixtures and storage reset
  test_accounts.py  — Account tests (13)
  test_jobs.py      — Job tests (27)
STRATEGY.md         — Testing approach and decisions
```

---

## Sample Job (Quick Test)

Register this job to test the app immediately:

| Field | Value |
|-------|-------|
| Name | `Books Scraper` |
| Target URL | `https://books.toscrape.com` |
| Pages per run | `50` |

Then click **Start** → account balance drops by 50. Click **Stop** → status changes to `stopped`.

To reset all data: press `Ctrl + C` in the terminal and restart with `uvicorn app.main:app --reload`.

---

## Accounts (pre-seeded)

| ID | Name | Username | Allowance |
|----|------|----------|-----------|
| 000 | Demo Account | demo | 500 |
| 001 | Abdur | abdur | 1000 |
| 002 | Rehman | rehman | 100 |
| 007 | James Bond | james | 1000 |
| 003 | John Wick | john | 800 |
| 004 | Hjvor | hjvor | 500 |
