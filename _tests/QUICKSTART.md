# Quick Start - Running Tests

## Prerequisites

1. **Update Node.js** (if needed):
   ```bash
   nvm use 20.18.1
   ```

2. **Install dependencies** (already done):
   ```bash
   npm install
   ```

3. **Browsers installed** (already done):
   ```bash
   npx playwright install chromium
   ```

## Running Tests

### Option 1: Start dev server separately (Recommended)

In one terminal:
```bash
npm run dev
```

In another terminal:
```bash
npm run test:e2e
```

### Option 2: Let Playwright start the dev server

Simply run:
```bash
npm run test:e2e
```

**Note:** This may take 2+ minutes as it waits for the dev server to be ready.

## View Results

After tests run, view the HTML report:
```bash
npm run test:report
```

## UI Mode (Best for Development)

Run tests interactively with a nice UI:
```bash
npm run test:e2e:ui
```

This lets you:
- See tests in real-time
- Debug failed tests
- Inspect each step
- Watch mode

## Quick Test

Test just the homepage:
```bash
npx playwright test homepage
```

## Next Steps

1. **Run all tests** to see what passes/fails
2. **Review failing tests** - some may need database setup or specific data
3. **Add authentication setup** for admin tests (see tests/README.md)
4. **Create test fixtures** for file upload tests
5. **Customize tests** for your specific project structure

## Troubleshooting

### Dev server timeout
If you get "Timed out waiting from config.webServer", either:
- Start dev server manually first (`npm run dev`)
- Increase timeout in `playwright.config.ts` (line 68)

### Environment variables
Make sure `.env` file exists with required Supabase credentials.

### Port conflicts
If port 5173 is in use, update `playwright.config.ts` baseURL and webServer.url.
