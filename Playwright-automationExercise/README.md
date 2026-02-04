# Playwright TypeScript Framework

A comprehensive Playwright automation framework built with TypeScript using the Page Object Model (POM) design pattern.

## 🚀 Features

- **Page Object Model (POM)** - Clean and maintainable test structure
- **TypeScript** - Type-safe test automation
- **Allure Reporting** - Beautiful and detailed test reports
- **Screenshot on Failure** - Automatic screenshot capture on test failures
- **Multiple Browser Support** - Chrome, Firefox, and Safari/WebKit
- **Configurable** - Easy environment and configuration management
- **Base Page Class** - Reusable methods for common actions

## 📁 Folder Structure

```
PlaywrightTypeScriptFramework/
├── base/                 # Base classes (BasePage, BaseTest)
│   ├── BasePage.ts      # Base page class with common methods
│   └── BaseTest.ts      # Base test class with custom fixtures
├── config/               # Configuration files
│   └── config.ts        # Environment and test configuration
├── pages/                # Page Object Model classes
│   └── README.md        # Guide for creating page objects
├── tests/                # Test files
│   └── README.md        # Guide for writing tests
├── utils/                # Helper utilities
│   ├── helpers.ts       # Utility functions
│   └── test-fixtures.ts # Custom test fixtures
├── screenshots/          # Screenshots on test failure (auto-generated)
├── reports/              # Test reports (auto-generated)
├── allure-results/       # Allure test results (auto-generated)
├── allure-report/        # Allure HTML report (auto-generated)
├── playwright.config.ts  # Playwright configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # NPM dependencies and scripts
└── README.md            # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright Browsers

```bash
npm run install:browsers
```

Or let Playwright install them automatically on first run.

### 3. Configure Base URL

You can configure the base URL in two ways:

**Option 1: Edit config file** (Recommended for static configuration)

Edit the `config/config.ts` file to set your application's base URL:

```typescript
export const config = {
  baseURL: process.env.BASE_URL || 'https://your-application-url.com',
  // ... other configurations
};
```

**Option 2: Use environment variables** (Recommended for different environments)

Create a `.env` file in the root directory:

```env
BASE_URL=https://your-application-url.com
BROWSER=chromium
HEADLESS=true
```

Or set environment variables directly:

```bash
# Windows (PowerShell)
$env:BASE_URL="https://your-application-url.com"

# Windows (CMD)
set BASE_URL=https://your-application-url.com

# Linux/Mac
export BASE_URL=https://your-application-url.com
```

**Note:** To use `.env` files, you may need to install `dotenv` (already included in dependencies) and load it in your configuration.

## 🧪 Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Headed Mode (see browser)

```bash
npm run test:headed
```

### Run Tests in UI Mode (interactive)

```bash
npm run test:ui
```

### Run Tests in Debug Mode

```bash
npm run test:debug
```

### Run Tests for a Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run a Specific Test File

```bash
npx playwright test tests/example.spec.ts
```

## 📊 Allure Reports

### Generate Allure Report

After running tests, generate the Allure report:

```bash
npm run allure:generate
```

### Open Allure Report

```bash
npm run allure:open
```

### Serve Allure Report (Alternative)

```bash
npm run allure:serve
```

**Note:** Make sure you have Allure installed on your system. If not, install it:

- **Windows (using Chocolatey):**
  ```bash
  choco install allure
  ```

- **Mac (using Homebrew):**
  ```bash
  brew install allure
  ```

- **Linux:**
  ```bash
  # Follow instructions at https://docs.qameta.io/allure/#_get_started
  ```

Or use npm to install Allure globally:
```bash
npm install -g allure-commandline
```

## 📸 Screenshots

Screenshots are automatically captured on test failures and saved in the `screenshots/` directory with timestamped filenames.

## 📝 Writing Tests

### Creating a Page Object

1. Create a new file in the `pages/` directory (e.g., `LoginPage.ts`)
2. Extend the `BasePage` class
3. Define locators and page-specific methods

Example:

```typescript
import { Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export class LoginPage extends BasePage {
  private readonly usernameInput = '#username';
  private readonly passwordInput = '#password';
  private readonly loginButton = '#login-button';

  constructor(page: Page) {
    super(page);
  }

  async login(username: string, password: string): Promise<void> {
    await this.type(this.usernameInput, username);
    await this.type(this.passwordInput, password);
    await this.click(this.loginButton);
  }
}
```

### Writing a Test

1. Create a new test file in the `tests/` directory (e.g., `login.spec.ts`)
2. Import `test` and `expect` from `./setup` (this enables custom fixtures and screenshot capture)
3. Use the custom test fixture to access page objects
4. Write your test cases

Example:

```typescript
import { test, expect } from './setup';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Tests', () => {
  test('should login successfully', async ({ page, basePage }) => {
    const loginPage = new LoginPage(page);
    
    await basePage.navigateTo('/login');
    await loginPage.login('username', 'password');
    
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

**Note:** Always import from `./setup` instead of directly from Playwright to enable:
- Custom fixtures (basePage)
- Automatic timestamped screenshots on test failure

## ⚙️ Configuration

### Environment Configuration

Modify `config/config.ts` to configure:
- Base URL
- Browser settings
- Timeouts
- Test data
- Environment-specific settings

### Playwright Configuration

Modify `playwright.config.ts` to configure:
- Test directory
- Parallel execution
- Retries
- Reporters
- Browser projects
- Screenshot and video settings

## 🎯 Available Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests in headless mode |
| `npm run test:headed` | Run tests in headed mode (visible browser) |
| `npm run test:ui` | Run tests in UI mode (interactive) |
| `npm run test:debug` | Run tests in debug mode |
| `npm run allure:generate` | Generate Allure HTML report |
| `npm run allure:open` | Open generated Allure report |
| `npm run allure:serve` | Serve Allure report from results |
| `npm run install:browsers` | Install Playwright browsers |

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Allure Framework Documentation](https://docs.qameta.io/allure/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Write or update tests
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

ISC

## 🆘 Troubleshooting

### Allure command not found

Make sure Allure is installed on your system. See the [Allure Reports](#-allure-reports) section for installation instructions.

### Browsers not installed

Run `npm run install:browsers` to install Playwright browsers.

### TypeScript errors

Make sure all dependencies are installed: `npm install`

### Screenshots not being captured

Ensure the `screenshots/` directory exists and has write permissions. The framework will create it automatically, but you can create it manually if needed.

## 📧 Support

For issues and questions, please create an issue in the repository.

