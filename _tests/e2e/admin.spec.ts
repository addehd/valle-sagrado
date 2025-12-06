import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard - Public Access', () => {
  test('should handle unauthorized access appropriately', async ({ page }) => {
    await page.goto('/admin');
    
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    
    // Should either redirect away or show unauthorized message
    const isRedirected = !currentUrl.includes('/admin');
    const hasUnauthorizedMessage = await page.locator('text=/unauthorized|forbidden|access denied|login|sign in/i').count() > 0;
    
    expect(isRedirected || hasUnauthorizedMessage).toBeTruthy();
  });

  test('should not display admin products page without auth', async ({ page }) => {
    await page.goto('/admin/products');
    
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    
    // Should be redirected or blocked
    const isBlocked = !currentUrl.includes('/admin/products') || 
                      await page.locator('text=/unauthorized|forbidden|access denied/i').count() > 0;
    
    expect(isBlocked).toBeTruthy();
  });

  test('should not allow product creation without auth', async ({ page }) => {
    await page.goto('/admin/products/create');
    
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    
    // Should be redirected or blocked
    const isBlocked = !currentUrl.includes('/admin/products/create') ||
                      await page.locator('text=/unauthorized|forbidden|access denied/i').count() > 0;
    
    expect(isBlocked).toBeTruthy();
  });
});

// For authenticated admin tests, you would need to set up authentication
// This would typically involve:
// 1. Creating a test admin user in your test database
// 2. Logging in programmatically before tests
// 3. Using auth state storage for faster subsequent tests

test.describe.skip('Admin Dashboard - Authenticated', () => {
  // These tests would run after authentication
  // Use test.use({ storageState: 'path/to/auth.json' }) after logging in
  
  test('should display dashboard stats', async ({ page }) => {
    await page.goto('/admin');
    
    // Check for stats cards
    await expect(page.locator('text=/total products/i')).toBeVisible();
    await expect(page.locator('text=/active products/i')).toBeVisible();
    await expect(page.locator('text=/total orders/i')).toBeVisible();
  });

  test('should navigate to products management', async ({ page }) => {
    await page.goto('/admin');
    
    const productsLink = page.locator('a[href="/admin/products"]');
    await productsLink.click();
    
    await expect(page).toHaveURL(/.*\/admin\/products/);
  });
});
