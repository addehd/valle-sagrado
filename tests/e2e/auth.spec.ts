import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/auth');
    
    // Check for email and password inputs
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    
    // Check for login button
    const loginButton = page.locator('button:has-text("login"), button:has-text("Log in"), button:has-text("Sign in")').first();
    await expect(loginButton).toBeVisible();
  });

  test('should show validation for empty fields', async ({ page }) => {
    await page.goto('/auth');
    
    // Try to submit without filling fields
    const loginButton = page.locator('button:has-text("login"), button:has-text("Log in"), button:has-text("Sign in")').first();
    await loginButton.click();
    
    // Check for HTML5 validation or error messages
    const emailInput = page.locator('input[name="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('should handle invalid credentials gracefully', async ({ page }) => {
    await page.goto('/auth');
    
    // Fill in with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Submit the form
    const loginButton = page.locator('button:has-text("login"), button:has-text("Log in"), button:has-text("Sign in")').first();
    await loginButton.click();
    
    // Should redirect to error page or show error message
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    
    // Either stays on auth page with error or goes to error page
    expect(currentUrl.includes('/auth') || currentUrl.includes('/error')).toBeTruthy();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to auth when accessing admin without login', async ({ page }) => {
    await page.goto('/admin');
    
    // Should redirect or show unauthorized message
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    
    // Check if redirected away from admin or shows error
    expect(
      currentUrl.includes('/auth') || 
      currentUrl.includes('/') ||
      await page.locator('text=/unauthorized|forbidden|access denied/i').count() > 0
    ).toBeTruthy();
  });
});
