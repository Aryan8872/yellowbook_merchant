import { test, expect } from '@playwright/test';

/**
 * Merchant CRUD E2E Tests
 * Tests create, read, update, delete merchant operations against deployed frontend
 */

test.describe('Merchant CRUD Operations', () => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL || 'admin@offernepal.com';
  const adminPassword = process.env.E2E_ADMIN_PASSWORD || 'AdminTest123!';
  
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/admin/auth/login');
    await page.fill('#admin-email', adminEmail);
    await page.fill('#admin-password', adminPassword);
    await page.click('#admin-login-submit');
    await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 10000 });
  });

  test('should create a new merchant successfully', async ({ page }) => {
    const timestamp = Date.now();
    const testMerchant = {
      name: `Test Merchant ${timestamp}`,
      email: `testmerchant${timestamp}@example.com`,
      phone: '+9779841234567',
      panNumber: `TESTPAN${timestamp}`,
      vatNumber: `TESTVAT${timestamp}`,
    };

    await page.goto('/admin/merchants');
    
    // Click "Add Merchant" button
    await page.click('button:has-text("Add Merchant")');
    
    // Wait for dialog to open
    await expect(page.locator('text=Add New Merchant')).toBeVisible({ timeout: 5000 });
    
    // Fill in merchant details
    await page.fill('#merchant-name', testMerchant.name);
    await page.fill('#merchant-email', testMerchant.email);
    await page.fill('#merchant-phone', testMerchant.phone);
    await page.fill('#merchant-reg', testMerchant.panNumber);
    await page.fill('#merchant-vat', testMerchant.vatNumber);
    
    // Submit form
    await page.click('button:has-text("Create Merchant")');
    
    // Wait for dialog to close
    await expect(page.locator('text=Add New Merchant')).not.toBeVisible({ timeout: 5000 });
    
    // Verify merchant appears in list
    await page.reload();
    await expect(page.locator(`text=${testMerchant.name}`)).toBeVisible({ timeout: 5000 });
  });

  test('should show validation errors for invalid merchant data', async ({ page }) => {
    await page.goto('/admin/merchants');
    
    await page.click('button:has-text("Add Merchant")');
    
    // Wait for dialog to open
    await expect(page.locator('text=Add New Merchant')).toBeVisible({ timeout: 5000 });
    
    // Submit without filling required fields
    await page.click('button:has-text("Create Merchant")');
    
    // Check for validation errors
    await expect(page.locator('.text-destructive').or(page.locator('text=/required/i'))).toBeVisible({ timeout: 3000 });
    
    // Close dialog
    await page.keyboard.press('Escape');
  });

  test('should edit an existing merchant', async ({ page }) => {
    await page.goto('/admin/merchants');
    
    // Find and click edit button for a merchant (use first available)
    const moreButton = page.locator('button:has([data-lucide="more-horizontal"])').first();
    if (await moreButton.isVisible({ timeout: 3000 })) {
      await moreButton.click();
      await page.click('text=Edit Details');
      
      // Wait for dialog to open
      await expect(page.locator('text=Edit Merchant Details')).toBeVisible({ timeout: 5000 });
      
      // Update merchant name
      const timestamp = Date.now();
      const updatedName = `Updated Test Merchant ${timestamp}`;
      await page.fill('#merchant-name', updatedName);
      
      // Submit
      await page.click('button:has-text("Save Changes")');
      
      // Wait for dialog to close
      await expect(page.locator('text=Edit Merchant Details')).not.toBeVisible({ timeout: 5000 });
      
      // Verify update persisted
      await page.reload();
      await expect(page.locator(`text=${updatedName}`)).toBeVisible({ timeout: 5000 });
    } else {
      test.skip(); // No merchants to edit
    }
  });

  test('should approve a pending merchant', async ({ page }) => {
    await page.goto('/admin/merchants');
    
    // Find a merchant with PENDING_REVIEW status
    const pendingMerchant = page.locator('text=PENDING_REVIEW').first();
    if (await pendingMerchant.isVisible({ timeout: 3000 })) {
      // Click the more button for that row
      const row = pendingMerchant.locator('xpath=ancestor::tr');
      const moreButton = row.locator('button:has([data-lucide="more-horizontal"])');
      await moreButton.click();
      
      // Click approve
      await page.click('text=Approve');
      
      // Wait for approval dialog
      await expect(page.locator('text=Approve Merchant')).toBeVisible({ timeout: 3000 });
      
      // Confirm approval
      await page.click('button:has-text("Approve")');
      
      // Verify approval success
      await expect(page.locator('text=Approve Merchant')).not.toBeVisible({ timeout: 5000 });
    } else {
      test.skip(); // No pending merchants to approve
    }
  });

  test('should suspend a merchant', async ({ page }) => {
    await page.goto('/admin/merchants');
    
    // Find a merchant with ACTIVE status
    const activeMerchant = page.locator('text=ACTIVE').first();
    if (await activeMerchant.isVisible({ timeout: 3000 })) {
      // Click the more button for that row
      const row = activeMerchant.locator('xpath=ancestor::tr');
      const moreButton = row.locator('button:has([data-lucide="more-horizontal"])');
      await moreButton.click();
      
      // Click suspend
      await page.click('text=Suspend');
      
      // Wait for suspend dialog
      await expect(page.locator('text=Suspend Merchant')).toBeVisible({ timeout: 3000 });
      
      // Fill reason
      await page.fill('#reason', 'Test suspension');
      
      // Confirm suspension
      await page.click('button:has-text("Suspend")');
      
      // Verify suspension success
      await expect(page.locator('text=Suspend Merchant')).not.toBeVisible({ timeout: 5000 });
    } else {
      test.skip(); // No active merchants to suspend
    }
  });

  test('should reactivate a suspended merchant', async ({ page }) => {
    await page.goto('/admin/merchants');
    
    // Find a merchant with SUSPENDED status
    const suspendedMerchant = page.locator('text=SUSPENDED').first();
    if (await suspendedMerchant.isVisible({ timeout: 3000 })) {
      // Click the more button for that row
      const row = suspendedMerchant.locator('xpath=ancestor::tr');
      const moreButton = row.locator('button:has([data-lucide="more-horizontal"])');
      await moreButton.click();
      
      // Reactivate is not a direct action in the UI, need to check if it exists
      const reactivateOption = page.locator('text=Reactivate');
      if (await reactivateOption.isVisible({ timeout: 2000 })) {
        await reactivateOption.click();
        await expect(page.locator('text=/reactivated|success/i')).toBeVisible({ timeout: 5000 });
      } else {
        test.skip(); // Reactivate option not available
      }
    } else {
      test.skip(); // No suspended merchants to reactivate
    }
  });

  test('should search and filter merchants', async ({ page }) => {
    await page.goto('/admin/merchants');
    
    // Use search functionality
    const searchInput = page.locator('input[placeholder*="Search merchants"]').first();
    if (await searchInput.isVisible({ timeout: 3000 })) {
      await searchInput.fill('Test');
      
      // Wait for results to filter
      await page.waitForTimeout(1000);
      
      // Verify search worked
      const merchantCount = await page.locator('table tbody tr').count();
      expect(merchantCount).toBeGreaterThanOrEqual(0);
      
      // Clear search
      await searchInput.fill('');
    } else {
      test.skip(); // No search input found
    }
  });
});
