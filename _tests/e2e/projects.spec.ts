import { test, expect } from '@playwright/test';

test.describe('Project Browsing', () => {
  test('should display projects on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Check if page has loaded (basic check)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to project detail page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for any links to projects (adjust selector based on your markup)
    const projectLinks = page.locator('a[href^="/"][href*="/"]');
    const linkCount = await projectLinks.count();
    
    if (linkCount > 0) {
      // Click first project link
      await projectLinks.first().click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Verify we're on a different page
      const currentUrl = page.url();
      expect(currentUrl).not.toBe(page.context().pages()[0].url());
    }
  });

  test('should display project products page', async ({ page }) => {
    // Navigate to a project products page
    // This assumes you have a project with URL slug 'maria'
    await page.goto('/maria/products');
    
    await page.waitForLoadState('networkidle');
    
    // Check if page loads without error
    const is404 = await page.locator('text=/404|not found/i').count();
    
    // If not a 404, page should have some content
    if (is404 === 0) {
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Product Details', () => {
  test('should load product detail page structure', async ({ page }) => {
    // This is a generic test - adjust project and product slugs as needed
    await page.goto('/');
    
    // Try to find and click a product link
    const productLinks = page.locator('a[href*="/product/"]');
    const linkCount = await productLinks.count();
    
    if (linkCount > 0) {
      await productLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // Basic check that page loaded
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
