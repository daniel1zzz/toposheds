import { test, expect } from '@playwright/test';

test.describe('Project Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.project-item', { timeout: 15000 });
    // Wait for React hydration
    await page.waitForFunction(() => {
      const grid = document.querySelector('.grid.grid-cols-1');
      return grid && grid.children.length > 0;
    }, { timeout: 15000 });
  });

  test('opens modal when clicking a project card', async ({ page }) => {
    const firstCard = page.locator('.project-item').first();
    await firstCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 10000 });

    const modalImage = modal.locator('img');
    await expect(modalImage).toBeVisible();
    await expect(modalImage).toHaveAttribute('src', /projects\/.*\.webp/);
  });

  test('closes modal when clicking close button', async ({ page }) => {
    const firstCard = page.locator('.project-item').first();
    await firstCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 10000 });

    await page.locator('[aria-label="Close modal"]').click();
    await expect(modal).toBeHidden({ timeout: 5000 });
  });

  test('closes modal when clicking backdrop', async ({ page }) => {
    const firstCard = page.locator('.project-item').first();
    await firstCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 10000 });

    await page.click('[role="dialog"]', { position: { x: 10, y: 10 } });
    await expect(modal).toBeHidden({ timeout: 5000 });
  });

  test('navigates between images with arrow buttons', async ({ page }) => {
    const firstCard = page.locator('.project-item').first();
    await firstCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 10000 });

    const counter = modal.locator('text=/\\d+ \\/ \\d+/');
    const initialCounter = await counter.textContent();
    expect(initialCounter).toContain('1 /');

    if ((await modal.locator('[aria-label="Next image"]').isEnabled())) {
      await modal.locator('[aria-label="Next image"]').click();
      const secondCounter = await counter.textContent();
      expect(secondCounter).toContain('2 /');

      await modal.locator('[aria-label="Previous image"]').click();
      const backCounter = await counter.textContent();
      expect(backCounter).toContain('1 /');
    }
  });

  test('navigates with keyboard arrows', async ({ page }) => {
    const firstCard = page.locator('.project-item').first();
    await firstCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 10000 });

    if ((await modal.locator('[aria-label="Next image"]').isEnabled())) {
      await page.keyboard.press('ArrowRight');
      const counter = modal.locator('text=/\\d+ \\/ \\d+/');
      await expect(counter).toContainText('2 /');

      await page.keyboard.press('ArrowLeft');
      await expect(counter).toContainText('1 /');
    }
  });

  test('closes modal with Escape key', async ({ page }) => {
    const firstCard = page.locator('.project-item').first();
    await firstCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 10000 });

    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden({ timeout: 5000 });
  });
});

test.describe('Project Modal - Mobile Swipe', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('swipes left to go to next image on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.project-item', { timeout: 15000 });
    await page.waitForFunction(() => {
      const grid = document.querySelector('.grid.grid-cols-1');
      return grid && grid.children.length > 0;
    }, { timeout: 15000 });

    const firstCard = page.locator('.project-item').first();
    await firstCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 10000 });

    const imageContainer = modal.locator('.flex.flex-col.items-center').first();
    
    if (await modal.locator('[aria-label="Next image"]').isEnabled()) {
      await imageContainer.dispatchEvent('touchstart', {
        touches: [{ clientX: 500, clientY: 300, identifier: 1 }],
      });
      await imageContainer.dispatchEvent('touchmove', {
        touches: [{ clientX: 300, clientY: 300, identifier: 1 }],
      });
      await imageContainer.dispatchEvent('touchend', {});

      const counter = modal.locator('text=/\\d+ \\/ \\d+/');
      await expect(counter).toContainText('2 /', { timeout: 5000 });
    }
  });

  test('swipes right to go to previous image on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.project-item', { timeout: 15000 });
    await page.waitForFunction(() => {
      const grid = document.querySelector('.grid.grid-cols-1');
      return grid && grid.children.length > 0;
    }, { timeout: 15000 });

    const firstCard = page.locator('.project-item').first();
    await firstCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 10000 });

    if (await modal.locator('[aria-label="Next image"]').isEnabled()) {
      await modal.locator('[aria-label="Next image"]').click();
    }

    const imageContainer = modal.locator('.flex.flex-col.items-center').first();
    
    if (await modal.locator('[aria-label="Previous image"]').isEnabled()) {
      await imageContainer.dispatchEvent('touchstart', {
        touches: [{ clientX: 300, clientY: 300, identifier: 1 }],
      });
      await imageContainer.dispatchEvent('touchmove', {
        touches: [{ clientX: 500, clientY: 300, identifier: 1 }],
      });
      await imageContainer.dispatchEvent('touchend', {});

      const counter = modal.locator('text=/\\d+ \\/ \\d+/');
      await expect(counter).toContainText('1 /', { timeout: 5000 });
    }
  });
});

test.describe('Category Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.project-item', { timeout: 10000 });
  });

  test('filters projects by category', async ({ page }) => {
    const categoryBtn = page.locator('#category-filter-btn');
    await expect(categoryBtn).toBeVisible();

    await categoryBtn.click();
    await page.locator('[role="option"][data-category="bathroom"]').click();

    const visibleCards = page.locator('.project-item:visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);

    for (const card of await visibleCards.all()) {
      await expect(card).toHaveAttribute('data-category', 'bathroom');
    }
  });

  test('shows all projects when "All" is selected', async ({ page }) => {
    const categoryBtn = page.locator('#category-filter-btn');
    await categoryBtn.click();
    await page.locator('[role="option"][data-category="bathroom"]').click();

    await categoryBtn.click();
    await page.locator('[role="option"][data-category="all"]').click();

    const visibleCards = page.locator('.project-item:visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(5);
  });
});

test.describe('Model Filter (Sheds)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.project-item', { timeout: 10000 });
  });

  test('shows model filter only for sheds category', async ({ page }) => {
    const modelWrapper = page.locator('#model-filter-wrapper');
    await expect(modelWrapper).toHaveClass(/hidden/);

    await page.locator('#category-filter-btn').click();
    await page.locator('[role="option"][data-category="sheds"]').click();

    await expect(modelWrapper).not.toHaveClass(/hidden/);
  });

  test('filters projects by model', async ({ page }) => {
    await page.locator('#category-filter-btn').click();
    await page.locator('[role="option"][data-category="sheds"]').click();

    const modelBtn = page.locator('#model-filter-btn');
    await modelBtn.click();

    // Wait for model options to be populated (they're added dynamically)
    await page.waitForFunction(() => {
      const list = document.getElementById('model-filter-list');
      return list && list.querySelectorAll('[role="option"]').length > 1;
    }, { timeout: 10000 });

    const firstModel = page.locator('#model-filter-list [role="option"]').nth(1);
    const modelName = await firstModel.textContent();
    await firstModel.click();

    const visibleCards = page.locator('.project-item:visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);

    for (const card of await visibleCards.all()) {
      await expect(card).toHaveAttribute('data-model', modelName?.toLowerCase() || '');
    }
  });
});

test.describe('Image Loading', () => {
  test('all project images load correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.project-item', { timeout: 10000 });

    const cards = page.locator('.project-item');
    const count = await cards.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = cards.nth(i);
      const img = card.locator('img');
      await expect(img).toHaveAttribute('src', /projects\/.*\.webp/);
      
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('modal images load correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.project-item', { timeout: 10000 });

    const firstCard = page.locator('.project-item').first();
    await firstCard.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    const modalImage = modal.locator('img');
    await expect(modalImage).toBeVisible();
    
    const naturalWidth = await modalImage.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });
});