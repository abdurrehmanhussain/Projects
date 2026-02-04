# Tests Directory

This directory contains your test files.

## Structure

- Each test file should follow the naming convention: `*.spec.ts` or `*.test.ts`
- Tests should use the Page Object Model pattern
- Always import `test` and `expect` from `./setup` to enable custom fixtures and automatic screenshot capture

## Example Test File

```typescript
import { test, expect } from './setup';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Tests', () => {
  test('should login successfully with valid credentials', async ({ page, basePage }) => {
    const loginPage = new LoginPage(page);
    
    await basePage.navigateTo('/login');
    await loginPage.login('username', 'password');
    
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

**Important:** Always import `test` and `expect` from `./setup` to enable:
- Custom fixtures (basePage)
- Automatic screenshots on test failure with timestamps

## Running Tests

- Run all tests: `npm test`
- Run tests in headed mode: `npm run test:headed`
- Run tests in UI mode: `npm run test:ui`
- Run tests in debug mode: `npm run test:debug`

## Setup File

The `setup.ts` file in this directory configures:
- Custom test fixtures (basePage)
- Automatic screenshot capture on test failures
- Screenshots are saved to the `screenshots/` directory with timestamped filenames
