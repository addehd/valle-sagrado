import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Receipt Processing', () => {
  test('should display receipt upload page', async ({ page }) => {
    await page.goto('/fin');
    
    await page.waitForLoadState('networkidle');
    
    // Check if page has file upload interface
    // Should have either a file input or drag-and-drop area
    const hasFileInput = await page.locator('input[type="file"]').count() > 0;
    const hasDragDrop = await page.locator('text=/drag|drop|upload/i').count() > 0;
    
    expect(hasFileInput || hasDragDrop).toBeTruthy();
  });

  test('should show user receipts gallery', async ({ page }) => {
    await page.goto('/fin');
    
    await page.waitForLoadState('networkidle');
    
    // Check if receipts are displayed (or empty state message)
    const hasReceipts = await page.locator('[data-testid="receipt"], .receipt-item, .receipt-card').count() > 0;
    const hasEmptyState = await page.locator('text=/no receipts|empty|upload your first/i').count() > 0;
    
    // Either should show receipts or empty state
    expect(hasReceipts || hasEmptyState).toBeTruthy();
  });

  test('should accept valid file types', async ({ page }) => {
    await page.goto('/fin');
    
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.count() > 0) {
      // Check accepted file types
      const accept = await fileInput.getAttribute('accept');
      
      if (accept) {
        // Should accept images and PDFs
        const validTypes = ['image/', 'pdf', 'jpeg', 'png', 'jpg'];
        const hasValidType = validTypes.some(type => accept.toLowerCase().includes(type));
        expect(hasValidType).toBeTruthy();
      }
    }
  });

  // Note: File upload tests require actual test files
  // You would need to create test fixtures for this
  test.skip('should upload a receipt image', async ({ page }) => {
    await page.goto('/fin');
    
    const fileInput = page.locator('input[type="file"]').first();
    
    // Create a test file path (you'll need to add actual test files)
    const testFilePath = path.join(__dirname, '../fixtures/test-receipt.jpg');
    
    await fileInput.setInputFiles(testFilePath);
    
    // Wait for processing
    await page.waitForTimeout(2000);
    
    // Check for success message
    const successMessage = page.locator('text=/success|uploaded|processed/i');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
  });
});
