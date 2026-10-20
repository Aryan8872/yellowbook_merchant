# Testing Guide for OfferNepal

This guide covers the testing setup for the OfferNepal project, including E2E tests with Playwright and API tests with Jest + Supertest.

## Overview

- **Frontend E2E Tests**: Playwright - Tests the deployed Vercel frontend against the Railway backend
- **Backend API Tests**: Jest + Supertest - Tests NestJS API endpoints with test database

## Frontend E2E Tests (Playwright)

### Setup

Playwright is already installed and configured. The configuration is in `playwright.config.ts`.

### Environment Variables

Copy `.env.e2e.example` to `.env.e2e` and fill in your test credentials:

```bash
cp .env.e2e.example .env.e2e
```

Required variables:
- `E2E_BASE_URL`: Your deployed frontend URL (default: https://yellowbook-merchant.vercel.app)
- `E2E_ADMIN_EMAIL`: Admin test account email
- `E2E_ADMIN_PASSWORD`: Admin test account password
- `E2E_MERCHANT_EMAIL`: Merchant test account email
- `E2E_MERCHANT_PASSWORD`: Merchant test account password

### Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run tests in UI mode (interactive)
pnpm test:e2e:ui

# Run tests in debug mode
pnpm test:e2e:debug

# Run specific test file
pnpm test:e2e auth.spec.ts

# Run specific test
pnpm test:e2e -g "should login successfully"
```

### Test Coverage

Current E2E tests cover:

1. **Authentication Flow** (`e2e/auth.spec.ts`)
   - Redirect to admin login when not authenticated
   - Validation error for invalid admin credentials
   - Successful login with admin credentials (`/admin/auth/login`)
   - Successful login with merchant credentials (`/merchant/auth/login`)
   - Logout functionality
   - Session persistence after page refresh

2. **Merchant CRUD** (`e2e/merchant-crud.spec.ts`)
   - Create new merchant via dialog
   - Validation errors for invalid merchant data
   - Edit existing merchant via dropdown menu
   - Approve pending merchant
   - Suspend active merchant
   - Reactivate suspended merchant (if available)
   - Search and filter merchants

3. **User CRUD** (`e2e/user-crud.spec.ts`)
   - Create new user via dialog
   - Validation error for duplicate email
   - Edit existing user via dropdown menu
   - Deactivate active user
   - Activate inactive user
   - Delete user with confirmation dialog
   - Filter users by role

### Viewing Results

After running tests, view the HTML report:

```bash
# Open the HTML report
npx playwright show-report playwright-report
```

Test artifacts (screenshots, videos, traces) are saved in `test-results/` on failure.

## Backend API Tests (Jest + Supertest)

### Setup

The backend uses Jest with Supertest for API integration tests. Tests are located in the `test/` directory.

### Environment Variables for Tests

The CI/CD workflow sets up a test PostgreSQL database. For local testing, ensure you have:

```bash
DATABASE_URL=postgresql://test:test@localhost:5432/offernepal_test
JWT_SECRET=test-secret-key-for-testing
JWT_REFRESH_SECRET=test-refresh-secret-key-for-testing
NODE_ENV=test
```

### Running Tests

```bash
# Run all API tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e auth.e2e-spec.ts

# Run with coverage
pnpm test:cov

# Run in watch mode
pnpm test:watch
```

### Test Coverage

Current API tests cover:

1. **Authentication API** (`test/auth.e2e-spec.ts`)
   - User registration
   - Email validation
   - Password validation
   - Duplicate email rejection
   - Login with valid credentials
   - Login rejection for invalid credentials
   - Get current user (authenticated)
   - Token refresh

2. **Merchants API** (`test/merchants.e2e-spec.ts`)
   - Create merchant
   - Authentication required
   - Email validation
   - Phone format validation
   - Duplicate email rejection
   - List merchants
   - Get merchant by ID
   - Update merchant
   - Approve merchant
   - Suspend merchant
   - Reactivate merchant

3. **Offers API** (`test/offers.e2e-spec.ts`)
   - Create offer
   - Authentication required
   - Required field validation
   - Discount percentage validation
   - Image URL validation
   - List offers
   - Filter by category
   - Search by query
   - Get offer by ID
   - Update offer
   - Deactivate offer
   - Delete offer

4. **Users API** (`test/users.e2e-spec.ts`)
   - Create user
   - Authentication required
   - Email validation
   - Phone format validation
   - Role validation
   - Duplicate email rejection
   - List users
   - Get user by ID
   - Update user
   - Activate user
   - Deactivate user
   - Delete user

## CI/CD Integration

### Frontend E2E Tests

GitHub Actions workflow: `.github/workflows/e2e-tests.yml`

Triggers on:
- Push to master/main/develop
- Pull requests to master/main/develop
- Manual dispatch

The workflow:
1. Checks out code
2. Sets up Node.js and pnpm
3. Installs dependencies
4. Installs Playwright browsers
5. Runs E2E tests against deployed frontend
6. Uploads test results, screenshots, videos, and traces on failure

### Backend API Tests

GitHub Actions workflow: `.github/workflows/api-tests.yml`

Triggers on:
- Push to master/main/develop
- Pull requests to master/main/develop
- Manual dispatch

The workflow:
1. Checks out code
2. Sets up PostgreSQL service
3. Sets up Node.js and pnpm
4. Installs dependencies
5. Generates Prisma client
6. Runs database migrations
7. Runs API tests with test database
8. Uploads coverage reports
9. Comments PR with coverage summary

## Best Practices

### Writing E2E Tests

1. **Use unique test data**: Include timestamps to avoid conflicts
   ```typescript
   const timestamp = Date.now();
   const testEmail = `test-${timestamp}@example.com`;
   ```

2. **Clean up test data**: Use `beforeEach` or `afterEach` to clean up
   ```typescript
   afterAll(async () => {
     await prisma.user.deleteMany({ where: { email: { contains: 'test-e2e' } } });
   });
   ```

3. **Wait for elements**: Use Playwright's auto-waiting or explicit waits
   ```typescript
   await expect(page.locator('text=Success')).toBeVisible({ timeout: 5000 });
   ```

4. **Test both success and failure cases**: Ensure validation errors are handled

### Writing API Tests

1. **Test authentication**: Verify protected endpoints reject unauthenticated requests
2. **Test validation**: Verify invalid data returns 400 with proper error messages
3. **Test authorization**: Verify users can only access their own resources
4. **Test edge cases**: Empty arrays, null values, boundary conditions
5. **Clean up database**: Use test transactions or cleanup in `afterAll`

### Test Data Management

- Use a separate test database
- Create test accounts with known credentials
- Use environment variables for sensitive test data
- Never use production data for tests

## Debugging Failed Tests

### E2E Tests

1. **Run in debug mode**: `pnpm test:e2e:debug`
2. **View screenshots**: Check `test-results/screenshots/`
3. **View videos**: Check `test-results/videos/`
4. **View traces**: Check `test-results/traces/` (open in Playwright trace viewer)
5. **Run in UI mode**: `pnpm test:e2e:ui` for interactive debugging

### API Tests

1. **Run in watch mode**: `pnpm test:watch`
2. **Add console.log**: Temporary logging for debugging
3. **Check database**: Verify test data was created correctly
4. **Check logs**: Review NestJS logs for errors

## Adding New Tests

### New E2E Test

1. Create new file in `e2e/` directory: `e2e/new-feature.spec.ts`
2. Import test utilities: `import { test, expect } from '@playwright/test';`
3. Write test cases following existing patterns
4. Run the test: `pnpm test:e2e new-feature.spec.ts`

### New API Test

1. Create new file in `test/` directory: `test/new-feature.e2e-spec.ts`
2. Import test utilities:
   ```typescript
   import { Test, TestingModule } from '@nestjs/testing';
   import { INestApplication, ValidationPipe } from '@nestjs/common';
   import * as request from 'supertest';
   import { AppModule } from './../src/app.module';
   ```
3. Write test cases following existing patterns
4. Run the test: `pnpm test:e2e new-feature.e2e-spec.ts`

## Troubleshooting

### Playwright Tests Timeout

- Increase timeout in `playwright.config.ts`
- Check if the deployed frontend is accessible
- Verify environment variables are set correctly

### Database Connection Errors

- Verify PostgreSQL service is running (for local tests)
- Check DATABASE_URL is correct
- Ensure database migrations have been run

### Authentication Failures

- Verify test credentials are correct
- Check if test accounts exist in database
- Ensure JWT secrets are set correctly

## Continuous Improvement

- Add more test coverage for edge cases
- Add performance tests for critical endpoints
- Add load testing for API endpoints
- Monitor test execution time
- Review and update tests as features change
