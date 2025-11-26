# E2E Testing with Playwright

This directory contains end-to-end tests for the Valle Sagrado platform using Playwright.

## Setup

Tests are already configured. Make sure you have:
1. Node.js v20.18.1 or higher (use `nvm use 20.18.1`)
2. Playwright installed (`npm install`)
3. Browsers installed (`npx playwright install chromium`)

## Running Tests

### Run all tests (headless mode)
```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:report
```

### Run specific test file
```bash
npx playwright test tests/e2e/auth.spec.ts
```

### Run tests matching a pattern
```bash
npx playwright test --grep "authentication"
```

## Test Structure

### Current Test Suites

1. **homepage.spec.ts** - Homepage and navigation tests
   - Page load
   - Navigation elements
   - Responsive design

2. **auth.spec.ts** - Authentication flow tests
   - Login form display
   - Form validation
   - Invalid credentials handling
   - Protected route access

3. **projects.spec.ts** - Project browsing tests
   - Project listing
   - Project detail pages
   - Product pages
   - Navigation between pages

4. **receipts.spec.ts** - Receipt processing tests
   - Upload interface
   - File type validation
   - Receipt gallery
   - File upload (currently skipped - needs fixtures)

5. **admin.spec.ts** - Admin dashboard tests
   - Unauthorized access protection
   - Admin routes security
   - Dashboard stats (authenticated - skipped)

6. **map.spec.ts** - Interactive map tests
   - Map loading
   - Map container display
   - Map interactivity

## Test Coverage

### ✅ Currently Tested
- Page load and accessibility
- Form validation
- Authentication flows
- Protected route security
- File upload UI
- Map initialization
- Responsive design

### 🚫 Not Tested (As Requested)
- Stripe payment flows
- Payment processing

### 📝 Requires Setup
- Authenticated admin tests (need test user setup)
- File upload with actual files (need test fixtures)
- Database-dependent tests (need test database)

## Adding Authenticated Tests

To test authenticated features:

1. Create a setup script that logs in and saves auth state:
```typescript
// tests/setup/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/auth');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'testpassword');
  await page.click('button:has-text("login")');
  await page.waitForURL('/');
  await page.context().storageState({ path: 'tests/.auth/user.json' });
});
```

2. Update playwright.config.ts to use the auth state:
```typescript
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'chromium',
    use: { 
      ...devices['Desktop Chrome'],
      storageState: 'tests/.auth/user.json',
    },
    dependencies: ['setup'],
  },
]
```

## Test Fixtures

To test file uploads, create test fixtures:

```bash
mkdir -p tests/fixtures
# Add test images, PDFs, etc. to this directory
```

Then update the skipped tests in `receipts.spec.ts`.

## CI/CD Integration

Tests are configured to run in CI environments with:
- Automatic retries (2 retries on CI)
- Serial execution on CI
- HTML reports

Example GitHub Actions workflow:

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20.18.1'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

1. **Keep tests independent** - Each test should be able to run in isolation
2. **Use data-testid attributes** - For more reliable selectors
3. **Avoid hardcoded waits** - Use `waitForLoadState`, `waitForSelector`, etc.
4. **Clean up after tests** - Delete test data created during tests
5. **Use Page Object Model** - For complex pages, create page objects

## Troubleshooting

### Tests timing out
- Increase timeout in playwright.config.ts
- Check if dev server is starting correctly
- Ensure database/API dependencies are available

### Flaky tests
- Use proper waiting strategies (avoid `waitForTimeout`)
- Make selectors more specific
- Check for race conditions

### Tests pass locally but fail in CI
- Ensure CI has all required environment variables
- Check for timing differences (CI is often slower)
- Verify browser versions match

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Selectors](https://playwright.dev/docs/selectors)
- [Debugging Tests](https://playwright.dev/docs/debug)
