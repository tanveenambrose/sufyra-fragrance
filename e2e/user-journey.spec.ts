import { test, expect } from '@playwright/test';

test.describe('Sufyra Fragrance - E2E User Journey & Auth Flow', () => {

  test('1. Homepage & Catalog Browsing', async ({ page }) => {
    await page.goto('/');
    
    // Verify page loads and contains luxury branding
    await expect(page).toHaveTitle(/Sufyra/i);
    
    // Verify navigation links are visible
    const navProducts = page.locator('nav').getByRole('link', { name: /products|collection|all/i }).first();
    if (await navProducts.isVisible()) {
      await navProducts.click();
      await expect(page).toHaveURL(/\/products/);
    } else {
      await page.goto('/products');
    }

    // Verify products grid loads
    await page.waitForLoadState('networkidle');
    const productCards = page.locator('article, .group, [data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('2. Login & OTP Forgot Password Interface Flow', async ({ page }) => {
    await page.goto('/login');

    // Verify login form elements
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    const forgotBtn = page.getByRole('button', { name: /forgot password\?/i });
    await expect(forgotBtn).toBeVisible();

    // Click "Forgot Password?" to toggle account recovery view
    await forgotBtn.click();

    // Verify recovery view appeared with OTP button
    await expect(page.getByText(/sanctuary recovery|forgot password/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /send verification code/i })).toBeVisible();

    // Click "Back to Sign In"
    const backBtn = page.getByRole('button', { name: /back to sign in/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    // Verify returned to sign in form
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('3. Reset Password Route Validation', async ({ page }) => {
    await page.goto('/reset-password');

    // Without a recovery code/session, it should display the graceful expired/invalid state
    await page.waitForLoadState('networkidle');
    const expiredOrForm = page.locator('text=Recovery Link Expired or Invalid, text=Set New Password');
    await expect(expiredOrForm.first()).toBeVisible({ timeout: 10000 });
  });

  test('4. Registration Form Validation', async ({ page }) => {
    await page.goto('/register');

    // Verify registration inputs
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    const passwords = page.locator('input[type="password"]');
    await expect(passwords.first()).toBeVisible();
    await expect(passwords.nth(1)).toBeVisible();

    // Test mismatched passwords
    await page.getByLabel(/full name/i).fill('Test Visitor');
    await page.getByLabel(/email/i).fill('visitor@example.com');
    await passwords.first().fill('Pass123456');
    await passwords.nth(1).fill('Pass999999');

    await page.getByRole('button', { name: /create account|register/i }).first().click();

    // Should display mismatch error
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

});
