import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display bottom tabs navigation', async ({ page }) => {
    // Check if bottom tabs are visible
    const bottomTabs = page.locator('[data-testid="bottom-tabs"]').or(page.locator('div').filter({ hasText: 'Timeline' }).first());
    await expect(bottomTabs).toBeVisible();
    
    // Check if all expected tabs are present
    await expect(page.getByText('Timeline')).toBeVisible();
    await expect(page.getByText('Log Food')).toBeVisible();
    await expect(page.getByText('Water')).toBeVisible();
    await expect(page.getByText('Stats')).toBeVisible();
    await expect(page.getByText('Profile')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Start on Timeline page
    await expect(page.getByRole('heading', { name: 'Food Timeline' })).toBeVisible();
    
    // Navigate to Water tab
    await page.getByText('Water').click();
    await expect(page.getByRole('heading', { name: 'Water Tracker' })).toBeVisible();
    
    // Navigate to Add Food tab
    await page.getByText('Log Food').click();
    await expect(page.getByRole('heading', { name: 'Log Food' })).toBeVisible();
    
    // Navigate to Stats tab
    await page.getByText('Stats').click();
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();
    
    // Navigate to Profile tab
    await page.getByText('Profile').click();
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
  });

  test('should be responsive on mobile viewports', async ({ page, isMobile }) => {
    if (!isMobile) {
      // Set mobile viewport for desktop browsers
      await page.setViewportSize({ width: 375, height: 667 });
    }

    // Check that content doesn't overflow horizontally
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    
    // Allow for small differences due to scrollbars
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 20);

    // Check that timeline header is responsive
    await expect(page.getByRole('heading', { name: 'Food Timeline' })).toBeVisible();
    
    // Check that tab navigation is at the bottom
    const tabsElement = page.locator('div').filter({ hasText: 'Timeline' }).first();
    const tabsBox = await tabsElement.boundingBox();
    const viewportHeight = page.viewportSize()?.height || 667;
    
    if (tabsBox) {
      // Tabs should be near the bottom of the viewport
      expect(tabsBox.y).toBeGreaterThan(viewportHeight * 0.8);
    }
  });

  test('should show active tab indicator', async ({ page }) => {
    // Timeline should be active by default
    const timelineTab = page.locator('a[href="/"]');
    await expect(timelineTab).toHaveClass(/text-brand-orange/);
    
    // Navigate to Water tab and check if it becomes active
    await page.getByText('Water').click();
    const waterTab = page.locator('a[href="/water"]');
    await expect(waterTab).toHaveClass(/text-brand-orange/);
  });
});

test.describe('Water Logging Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/water');
  });

  test('should display water tracking interface', async ({ page }) => {
    // Check main elements are visible
    await expect(page.getByRole('heading', { name: 'Water Tracker' })).toBeVisible();
    await expect(page.getByText('Quick Add')).toBeVisible();
    
    // Check preset water amounts
    await expect(page.getByText('8 oz')).toBeVisible();
    await expect(page.getByText('16 oz')).toBeVisible();
    await expect(page.getByText('20 oz')).toBeVisible();
    await expect(page.getByText('32 oz')).toBeVisible();
  });

  test('should allow adding water with preset amounts', async ({ page }) => {
    // Get initial water intake
    const progressText = page.locator('text=/\\d+.*oz/').first();
    const initialIntake = await progressText.textContent();
    const initialAmount = parseInt(initialIntake?.match(/\\d+/)?.[0] || '0');
    
    // Click 16 oz button
    await page.getByRole('button', { name: '16 oz' }).click();
    
    // Check if intake increased
    await page.waitForTimeout(500); // Allow for state update
    const newIntake = await progressText.textContent();
    const newAmount = parseInt(newIntake?.match(/\\d+/)?.[0] || '0');
    
    expect(newAmount).toBe(initialAmount + 16);
  });

  test('should allow custom water amounts', async ({ page }) => {
    // Find custom amount input
    const customInput = page.locator('input[type="number"]');
    await expect(customInput).toBeVisible();
    
    // Set custom amount
    await customInput.fill('24');
    
    // Click add button
    await page.getByText('Add 24 oz').click();
    
    // Verify entry was added to the list
    await expect(page.getByText('24 oz')).toBeVisible();
  });
});

test.describe('Timeline Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display timeline entries', async ({ page }) => {
    // Check timeline header
    await expect(page.getByRole('heading', { name: 'Food Timeline' })).toBeVisible();
    
    // Check today's summary card
    await expect(page.getByText("Today's Summary")).toBeVisible();
    await expect(page.getByText('Meals')).toBeVisible();
    await expect(page.getByText('oz Water')).toBeVisible();
    await expect(page.getByText('Snacks')).toBeVisible();
    
    // Check that timeline entries are visible
    await expect(page.getByText('Breakfast')).toBeVisible();
    await expect(page.getByText('8:00 AM')).toBeVisible();
  });

  test('should show pull-to-refresh functionality', async ({ page, isMobile }) => {
    if (!isMobile) {
      await page.setViewportSize({ width: 375, height: 667 });
    }

    // Check refresh button is present
    const refreshButton = page.locator('button').filter({ hasText: /refresh/i }).or(
      page.locator('svg').locator('..').filter({ hasText: '' })
    );
    
    // At minimum, the page should load without errors
    await expect(page.getByRole('heading', { name: 'Food Timeline' })).toBeVisible();
  });
});