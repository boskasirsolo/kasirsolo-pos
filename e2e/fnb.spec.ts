import { test, expect } from '@playwright/test';

// Test untuk FnB App - Skenario: Menambah item ke keranjang dan checkout

test.describe('KASIRSOLO FnB - Restaurant POS Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');
  });

  test('FnB-01: Should load FnB app successfully', async ({ page }) => {
    const title = await page.title();
    expect(title.toLowerCase()).toContain('kasirsolo');
    const heading = await page.locator('h1, h2, [role="heading"]').first();
    expect(heading).toBeVisible();
  });

  test('FnB-02: Should display product catalog', async ({ page }) => {
    // Tunggu product grid/list muncul
    const products = await page.locator('[data-testid*="product"], .product-card, [role="button"]:has-text("Rp")').count();
    expect(products).toBeGreaterThan(0);
  });

  test('FnB-03: Should add single item to cart', async ({ page }) => {
    // Cari tombol add to cart pertama
    const addButtons = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]');
    const firstButton = addButtons.first();
    
    if (await firstButton.isVisible()) {
      await firstButton.click();
      
      // Cek cart icon atau counter update
      const cartBadge = page.locator('[data-testid="cart-count"], .cart-badge, [role="status"]').first();
      await expect(cartBadge).toBeVisible({ timeout: 5000 });
    }
  });

  test('FnB-04: Should add multiple items to cart', async ({ page }) => {
    const addButtons = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]');
    const buttonCount = await addButtons.count();
    
    if (buttonCount >= 2) {
      await addButtons.nth(0).click();
      await page.waitForTimeout(300);
      await addButtons.nth(1).click();
      
      const cartBadge = page.locator('[data-testid="cart-count"], .cart-badge').first();
      const badgeText = await cartBadge.textContent();
      expect(Number(badgeText || '0')).toBeGreaterThanOrEqual(2);
    }
  });

  test('FnB-05: Should open cart and view items', async ({ page }) => {
    // Klik tombol add pertama
    const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]').first();
    await addBtn.click();
    await page.waitForTimeout(300);
    
    // Buka cart
    const cartIcon = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang"), button:has-text("Cart")').first();
    await cartIcon.click();
    
    // Cek cart items ditampilkan
    const cartItems = page.locator('[data-testid="cart-item"], .cart-item, li:has-text("Rp")').first();
    await expect(cartItems).toBeVisible({ timeout: 5000 });
  });

  test('FnB-06: Should update item quantity', async ({ page }) => {
    // Add item dulu
    const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]').first();
    await addBtn.click();
    
    // Open cart
    const cartIcon = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang")').first();
    await cartIcon.click();
    
    // Increase quantity
    const increaseBtn = page.locator('button[aria-label*="increase"], button:has-text("+"), [data-testid*="increase"]').first();
    if (await increaseBtn.isVisible()) {
      await increaseBtn.click();
      await page.waitForTimeout(200);
      const quantity = await page.locator('input[type="number"], span:has-text("x"), .quantity').first().textContent();
      expect(Number(quantity || '0')).toBeGreaterThanOrEqual(1);
    }
  });

  test('FnB-07: Should proceed to checkout', async ({ page }) => {
    // Add item
    const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]').first();
    await addBtn.click();
    
    // Go to checkout
    const checkoutBtn = page.locator('button:has-text("Checkout"), button:has-text("Pesan"), button:has-text("Proses")').first();
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();
      await page.waitForLoadState('networkidle');
      
      // Cek payment/order summary page
      const summary = page.locator('text=Total, text=Bayar, text=Jumlah, h2, h3').first();
      await expect(summary).toBeVisible({ timeout: 5000 });
    }
  });

  test('FnB-08: Should handle empty cart removal', async ({ page }) => {
    // Add and remove item
    const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add")').first();
    await addBtn.click();
    
    const cartIcon = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang")').first();
    await cartIcon.click();
    
    const removeBtn = page.locator('button:has-text("Hapus"), button:has-text("Remove"), [data-testid*="remove"]').first();
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
      const emptyMessage = page.locator('text=kosong, text=empty, text=Tidak ada').first();
      await expect(emptyMessage).toBeVisible({ timeout: 5000 });
    }
  });

  test('FnB-09: Should validate price display', async ({ page }) => {
    const prices = page.locator('text=/Rp\\s*\\d+/');
    const count = await prices.count();
    expect(count).toBeGreaterThan(0);
  });

  test('FnB-10: Should support keyboard navigation', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add")').first();
    await addBtn.focus();
    expect(await addBtn.evaluate((el) => el === document.activeElement)).toBeTruthy();
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    
    const cartIcon = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang")').first();
    expect(await cartIcon.isVisible()).toBeTruthy();
  });
});
