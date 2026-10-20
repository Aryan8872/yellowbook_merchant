# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> should show validation error for invalid admin credentials
- Location: e2e\auth.spec.ts:21:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: .bg-destructive/10 >> internal:or="text=/invalid|credentials/i"
Expected: visible
Error: Unexpected token "/" while parsing css selector ".bg-destructive/10". Did you mean to CSS.escape it?

Call log:
  - Expect "toBeVisible" .bg-destructive/10 >> internal:or="text=/invalid|credentials/i" with timeout 5000ms
  - waiting for .bg-destructive/10 >> internal:or="text=/invalid|credentials/i"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e9]:
        - heading "OfferNepal Admin" [level=1] [ref=e10]:
          - text: OfferNepal
          - generic [ref=e11]: Admin
        - paragraph [ref=e12]: Platform Command Center
      - generic [ref=e13]:
        - generic [ref=e14]: Restricted Access — Authorized Personnel Only
        - generic [ref=e18]:
          - heading "Full platform oversight. Real-time intelligence." [level=2] [ref=e19]
          - paragraph [ref=e20]: Manage merchants, monitor redemptions, review fraud flags, and track system health — all from a single unified command center.
        - generic [ref=e21]:
          - generic [ref=e29]:
            - paragraph [ref=e30]: Merchant & User Management
            - paragraph [ref=e31]: Approve, suspend, and manage merchant accounts and end-user profiles.
          - generic [ref=e36]:
            - paragraph [ref=e37]: Platform-Wide Analytics
            - paragraph [ref=e38]: Revenue trends, customer acquisition, offer performance across all merchants.
          - generic [ref=e43]:
            - paragraph [ref=e44]: System Health Monitoring
            - paragraph [ref=e45]: Live API uptime, Redis status, and infrastructure metrics at a glance.
      - generic [ref=e46]:
        - generic [ref=e47]: © 2026 OfferNepal Inc. All rights reserved.
        - generic [ref=e48]: v1.0.0-ADMIN
    - generic [ref=e51]:
      - generic [ref=e52]:
        - generic [ref=e53]: Admin Sign In
        - generic [ref=e54]: Enter your administrator credentials to access the platform control panel
      - generic [ref=e56]:
        - generic [ref=e57]:
          - text: Administrator Email
          - textbox "Administrator Email" [ref=e62]:
            - /placeholder: admin@offernepal.com
            - text: invalid@example.com
        - generic [ref=e63]:
          - text: Password
          - generic [ref=e64]:
            - textbox "Password" [ref=e68]:
              - /placeholder: ••••••••••••
              - text: wrongpassword
            - button "Show password" [ref=e69]
        - button "Authenticating..." [disabled]
      - paragraph [ref=e74]:
        - text: Admin accounts are provisioned internally.
        - link "Contact engineering for access" [ref=e75] [cursor=pointer]:
          - /url: mailto:engineering@offernepal.com
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e81] [cursor=pointer]
  - alert [ref=e85]
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
> 29 |     await expect(page.locator('.bg-destructive\/10').or(page.locator('text=/invalid|credentials/i'))).toBeVisible({ timeout: 5000 });
     |                                                                                                       ^ Error: expect(locator).toBeVisible() failed
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
  65 |     await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 10000 });
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