import { test, expect } from '@playwright/test';

test.describe('Interactive Map', () => {
  test('should load the map page', async ({ page }) => {
    await page.goto('/map');
    
    await page.waitForLoadState('networkidle');
    
    // Check if page loads without major errors
    const is404 = await page.locator('text=/404|not found/i').count();
    expect(is404).toBe(0);
  });

  test('should display map container', async ({ page }) => {
    await page.goto('/map');
    
    // Wait for map to initialize
    await page.waitForTimeout(2000);
    
    // Check for common map elements (MapTiler SDK)
    const hasMapCanvas = await page.locator('canvas').count() > 0;
    const hasMapContainer = await page.locator('[class*="map"], #map, .maplibregl-map, .maptiler-map').count() > 0;
    
    expect(hasMapCanvas || hasMapContainer).toBeTruthy();
  });

  test('should be interactive', async ({ page }) => {
    await page.goto('/map');
    
    // Wait for map initialization
    await page.waitForTimeout(2000);
    
    const canvas = page.locator('canvas').first();
    
    if (await canvas.count() > 0) {
      // Try to interact with the map
      await canvas.click({ position: { x: 100, y: 100 } });
      
      // Map should still be visible after interaction
      await expect(canvas).toBeVisible();
    }
  });
});
