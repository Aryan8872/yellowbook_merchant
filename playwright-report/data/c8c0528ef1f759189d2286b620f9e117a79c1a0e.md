# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> should logout successfully
- Location: e2e\auth.spec.ts:57:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/admin\/dashboard/
Received string:  "http://localhost:3001/admin"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    5 × locator resolved to <html lang="en" class="antialiased geist_mono_b4d4e0d7-module__vc6T-a__variable font-sans space_grotesk_a4177b3f-module__DCxVEW__variable montserrat_9943cb3e-module__SopDpq__variable light">…</html>
      - unexpected value "http://localhost:3001/admin/auth/login"
    - waiting for "http://localhost:3001/admin/dashboard" navigation to finish...
    - navigated to "http://localhost:3001/admin"
    - locator resolved to <html lang="en" class="antialiased geist_mono_b4d4e0d7-module__vc6T-a__variable font-sans space_grotesk_a4177b3f-module__DCxVEW__variable montserrat_9943cb3e-module__SopDpq__variable">…</html>
    13 × unexpected value "http://localhost:3001/admin"
       - locator resolved to <html lang="en" class="antialiased geist_mono_b4d4e0d7-module__vc6T-a__variable font-sans space_grotesk_a4177b3f-module__DCxVEW__variable montserrat_9943cb3e-module__SopDpq__variable light">…</html>
    - unexpected value "http://localhost:3001/admin"

```

```yaml
- heading "OfferNepal Admin" [level=1]
- paragraph: Platform Administration
- navigation:
  - link "Dashboard":
    - /url: /admin
  - link "Users":
    - /url: /admin/users
  - link "Merchants":
    - /url: /admin/merchants
  - link "Analytics":
    - /url: /admin/analytics
  - link "Fraud Flags":
    - /url: /admin/fraud-flags
  - link "System Metrics":
    - /url: /admin/metrics
  - link "Settings":
    - /url: /admin/settings
- button "Logout"
- banner:
  - button "AU"
- main:
  - heading "Dashboard" [level=1]
  - paragraph: Welcome to the OfferNepal admin panel
  - link "Manage Users":
    - /url: /admin/users
    - button "Manage Users"
  - link "Review Merchants":
    - /url: /admin/merchants
    - button "Review Merchants"
  - link "Total Users 9 Registered users":
    - /url: /admin/users
    - text: Total Users 9
    - paragraph: Registered users
  - link "Total Merchants 5 All merchants":
    - /url: /admin/merchants
    - text: Total Merchants 5
    - paragraph: All merchants
  - link "Pending Approval 0 Awaiting review":
    - /url: /admin/merchants
    - text: Pending Approval 0
    - paragraph: Awaiting review
  - link "Active Offers 7 Live offers":
    - /url: /admin/analytics
    - text: Active Offers 7
    - paragraph: Live offers
  - text: Quick Actions
  - link "Manage Users":
    - /url: /admin/users
    - button "Manage Users"
  - link "Manage Merchants":
    - /url: /admin/merchants
    - button "Manage Merchants"
  - link "View Analytics":
    - /url: /admin/analytics
    - button "View Analytics"
  - link "Fraud Flags":
    - /url: /admin/fraud-flags
    - button "Fraud Flags"
  - text: Pending Merchants
  - paragraph: No merchants pending review. ✓
  - text: System Status API Status Operational Database Connected Cache Active
  - link "View Live Metrics →":
    - /url: /admin/metrics
    - button "View Live Metrics →"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * Authentication E2E Tests
  5  |  * Tests login, logout, and session behavior against deployed frontend
  6  |  */
  7  | 
  8  | test.describe('Authentication Flow', () => {
  9  |   const adminEmail = process.env.E2E_ADMIN_EMAIL || 'admin@offernepal.com';
  10 |   const adminPassword = process.env.E2E_ADMIN_PASSWORD || 'AdminTest123!';
  11 |   const merchantEmail = process.env.E2E_MERCHANT_EMAIL || 'merchant@offernepal.com';
  12 |   const merchantPassword = process.env.E2E_MERCHANT_PASSWORD || 'MerchantTest123!';
  13 | 
  14 |   test('should redirect to login page when not authenticated', async ({ page }) => {
  15 |     await page.goto('/admin/dashboard');
  16 |     // Should redirect to admin login
  17 |     await expect(page).toHaveURL(/.*\/admin\/auth\/login/);
  18 |     await expect(page.locator('text=Admin Sign In')).toBeVisible();
  19 |   });
  20 | 
  21 |   test('should show validation error for invalid admin credentials', async ({ page }) => {
  22 |     await page.goto('/admin/auth/login');
  23 |     
  24 |     await page.fill('#admin-email', 'invalid@example.com');
  25 |     await page.fill('#admin-password', 'wrongpassword');
  26 |     await page.click('#admin-login-submit');
  27 |     
  28 |     // Check for error message
  29 |     await expect(page.locator('.bg-destructive\/10').or(page.locator('text=/invalid|credentials/i'))).toBeVisible({ timeout: 5000 });
  30 |   });
  31 | 
  32 |   test('should login successfully with valid admin credentials', async ({ page }) => {
  33 |     await page.goto('/admin/auth/login');
  34 |     
  35 |     await page.fill('#admin-email', adminEmail);
  36 |     await page.fill('#admin-password', adminPassword);
  37 |     await page.click('#admin-login-submit');
  38 |     
  39 |     // Should redirect to admin dashboard
  40 |     await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 10000 });
  41 |     
  42 |     // Should show dashboard content
  43 |     await expect(page.locator('text=Dashboard').or(page.locator('h1'))).toBeVisible();
  44 |   });
  45 | 
  46 |   test('should login successfully with valid merchant credentials', async ({ page }) => {
  47 |     await page.goto('/merchant/auth/login');
  48 |     
  49 |     await page.fill('#email', merchantEmail);
  50 |     await page.fill('#password', merchantPassword);
  51 |     await page.click('button:has-text("Sign In with Email")');
  52 |     
  53 |     // Should redirect to merchant dashboard
  54 |     await expect(page).toHaveURL(/.*\/merchant\/dashboard/, { timeout: 10000 });
  55 |   });
  56 | 
  57 |   test('should logout successfully', async ({ page }) => {
  58 |     await page.goto('/admin/auth/login');
  59 |     
  60 |     // Login first
  61 |     await page.fill('#admin-email', adminEmail);
  62 |     await page.fill('#admin-password', adminPassword);
  63 |     await page.click('#admin-login-submit');
  64 |     
> 65 |     await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 10000 });
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  66 |     
  67 |     // Logout - look for user menu or logout button
  68 |     const logoutButton = page.locator('text=/logout|sign out/i').first();
  69 |     if (await logoutButton.isVisible({ timeout: 3000 })) {
  70 |       await logoutButton.click();
  71 |       // Should redirect to login
  72 |       await expect(page).toHaveURL(/.*\/admin\/auth\/login/);
  73 |     } else {
  74 |       test.skip(); // Logout button not found
  75 |     }
  76 |   });
  77 | 
  78 |   test('should persist session after page refresh', async ({ page }) => {
  79 |     await page.goto('/admin/auth/login');
  80 |     
  81 |     await page.fill('#admin-email', adminEmail);
  82 |     await page.fill('#admin-password', adminPassword);
  83 |     await page.click('#admin-login-submit');
  84 |     
  85 |     await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 10000 });
  86 |     
  87 |     // Refresh page
  88 |     await page.reload();
  89 |     
  90 |     // Should still be logged in
  91 |     await expect(page).toHaveURL(/.*\/admin\/dashboard/);
  92 |     await expect(page.locator('h1').or(page.locator('text=Dashboard'))).toBeVisible();
  93 |   });
  94 | });
  95 | 
```