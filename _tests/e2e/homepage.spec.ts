import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page).toHaveTitle(/Valle Sagrado/i);
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check if main navigation elements are present
    // Adjust selectors based on your actual navigation structure
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Valle Sagrado/i);
  });
});
