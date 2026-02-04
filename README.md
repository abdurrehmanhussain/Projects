# Shipin-Abd-ur-Rehman Test Automation Project

A multi-project test automation suite featuring E2E UI testing, PostgreSQL database testing, and gRPC API testing using Playwright.

## Prerequisites

Before running any tests, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Playwright browsers** - Install after npm packages are installed

### For Database Tests (Db-task-pgSQL)
- **PostgreSQL** - Running PostgreSQL instance
- Configure database connection in `.env` file

### For API Tests (api-gPRC)
- Internet connection to reach gRPC endpoints

---

## Project Structure

```
├── Playwright-automationExercise/   # E2E UI automation tests
├── Db-task-pgSql/                   # PostgreSQL database tests
└── api-gPRC/                        # gRPC API tests
```

---

## Running Tests

### 1. E2E Playwright Automation

UI automation tests using Page Object Model.

```bash
cd Playwright-automationExercise
npm install
npx playwright install
npx playwright test --project=e2e --headed  
```

### 2. Database Tests (PostgreSQL)

CRUD operations testing with PostgreSQL.

```bash
cd Db-task-pgSql
npm install
npx playwright install
npx playwright test --project=db-pgsql
```

### 3. API Tests (gRPC)

gRPC API testing using grpcb.in.

```bash
cd api-gPRC
npm install
npx playwright install
npx playwright test --project=api
```

---

## Quick Reference

| Project | Directory | Command |
|---------|-----------|---------|
| E2E UI Tests | `Playwright-automationExercise` | `npx playwright test --project=e2e --headed` |
| DB Tests     | `Db-task-pgSql`                 | `npx playwright test --project=db-pgsql` |
| API Tests    | `api-gPRC`                      | `npx playwright test --project=api` |

---

## Tech Stack

- **Playwright** - Test framework
- **TypeScript** - Programming language
- **Node.js** - Runtime environment
- **PostgreSQL** - Database (for DB tests)
- **gRPC** - API protocol (for API tests)
- **Allure** - Test reporting (E2E project)
