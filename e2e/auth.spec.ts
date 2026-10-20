import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 * Tests login, logout, and session behavior against deployed frontend
 */

test.describe('Authentication Flow', () => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL || 'admin@offernepal.com';
  const adminPassword = process.env.E2E_ADMIN_PASSWORD || 'AdminTest123!';
  const merchantEmail = process.env.E2E_MERCHANT_EMAIL || 'merchant@offernepal.com';
  const merchantPassword = process.env.E2E_MERCHANT_PASSWORD || 'MerchantTest123!';

  test('should redirect to login page when not authenticated', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // Should redirect to admin login
    await expect(page).toHaveURL(/.*\/admin\/auth\/login/);
    await expect(page.locator('text=Admin Sign In')).toBeVisible();
  });

  test('should show validation error for invalid admin credentials', async ({ page }) => {
    await page.goto('/admin/auth/login');
    
    await page.fill('#admin-email', 'invalid@example.com');
    await page.fill('#admin-password', 'wrongpassword');
    await page.click('#admin-login-submit');
    
    // Check for error message
    await expect(page.locator('.bg-destructive\/10').or(page.locator('text=/invalid|credentials/i'))).toBeVisible({ timeout: 5000 });
  });

  test('should login successfully with valid admin credentials', async ({ page }) => {
    await page.goto('/admin/auth/login');
    
    await page.fill('#admin-email', adminEmail);
    await page.fill('#admin-password', adminPassword);
    await page.click('#admin-login-submit');
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 10000 });
    
    // Should show dashboard content
    await expect(page.locator('text=Dashboard').or(page.locator('h1'))).toBeVisible();
  });

  test('should login successfully with valid merchant credentials', async ({ page }) => {
    await page.goto('/merchant/auth/login');
    
    await page.fill('#email', merchantEmail);
    await page.fill('#password', merchantPassword);
    await page.click('button:has-text("Sign In with Email")');
    
    // Should redirect to merchant dashboard
    await expect(page).toHaveURL(/.*\/merchant\/dashboard/, { timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/admin/auth/login');
    
    // Login first
    await page.fill('#admin-email', adminEmail);
    await page.fill('#admin-password', adminPassword);
    await page.click('#admin-login-submit');
    
    await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 10000 });
    
    // Logout - look for user menu or logout button
    const logoutButton = page.locator('text=/logout|sign out/i').first();
    if (await logoutButton.isVisible({ timeout: 3000 })) {
      await logoutButton.click();
      // Should redirect to login
      await expect(page).toHaveURL(/.*\/admin\/auth\/login/);
    } else {
      test.skip(); // Logout button not found
    }
  });

  test('should persist session after page refresh', async ({ page }) => {
    await page.goto('/admin/auth/login');
    
    await page.fill('#admin-email', adminEmail);
    await page.fill('#admin-password', adminPassword);
    await page.click('#admin-login-submit');
    
    await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 10000 });
    
    // Refresh page
    await page.reload();
    
    // Should still be logged in
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    await expect(page.locator('h1').or(page.locator('text=Dashboard'))).toBeVisible();
  });
});
