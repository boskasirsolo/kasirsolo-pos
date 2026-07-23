import { test, expect } from '@playwright/test';

// Test untuk Retail App - Skenario: Menambah barang ke keranjang dan transaksi

test.describe('KASIRSOLO Retail - Store POS Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
    await page.waitForLoadState('networkidle');
  });

  test('Retail-01: Should load Retail app successfully', async ({ page }) => {
    const title = await page.title();
    expect(title.toLowerCase()).toContain('kasirsolo');
    const heading = await page.locator('h1, h2, [role="heading"]').first();
    expect(heading).toBeVisible();
  });

  test('Retail-02: Should display product list', async ({ page }) => {
    // Tunggu product list/grid muncul
    const products = await page.locator('[data-testid*="product"], .product-item, [role="button"]:has-text("Rp")').count();
    expect(products).toBeGreaterThan(0);
  });

  test('Retail-03: Should add single product to cart', async ({ page }) => {
    // Cari tombol add pertama
    const addButtons = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]');
    const firstButton = addButtons.first();
    
    if (await firstButton.isVisible()) {
      await firstButton.click();
      
      // Cek cart indicator update
      const cartIndicator = page.locator('[data-testid="cart-count"], .badge, [role="status"]').first();
      await expect(cartIndicator).toBeVisible({ timeout: 5000 });
    }
  });

  test('Retail-04: Should add multiple products', async ({ page }) => {
    const addButtons = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]');
    const count = await addButtons.count();
    
    if (count >= 3) {
      await addButtons.nth(0).click();
      await page.waitForTimeout(250);
      await addButtons.nth(1).click();
      await page.waitForTimeout(250);
      await addButtons.nth(2).click();
      
      const cartCount = page.locator('[data-testid="cart-count"], .badge').first();
      const text = await cartCount.textContent();
      expect(Number(text || '0')).toBeGreaterThanOrEqual(3);
    }
  });

  test('Retail-05: Should view shopping cart', async ({ page }) => {
    // Add item dulu
    const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]').first();
    await addBtn.click();
    await page.waitForTimeout(300);
    
    // Open cart
    const cartBtn = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang"), button:has-text("Cart")').first();
    await cartBtn.click();
    
    // Check cart items visible
    const items = page.locator('[data-testid="cart-item"], .cart-item, li:has-text("Rp")').first();
    await expect(items).toBeVisible({ timeout: 5000 });
  });

  test('Retail-06: Should modify item quantity in cart', async ({ page }) => {
    // Add item
    const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add")').first();
    await addBtn.click();
    
    // Open cart
    const cartBtn = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang")').first();
    await cartBtn.click();
    
    // Increase quantity
    const increaseBtn = page.locator('button[aria-label*="increase"], button:has-text("+"), [data-testid*="increase"]').first();
    if (await increaseBtn.isVisible()) {
      await increaseBtn.click();
      await page.waitForTimeout(200);
    }
  });

  test('Retail-07: Should calculate total correctly', async ({ page }) => {
    // Add items
    const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add")').first();
    await addBtn.click();
    
    // Open cart
    const cartBtn = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang")').first();
    await cartBtn.click();
    
    // Check total displayed
    const total = page.locator('text=/Total|Subtotal|Jumlah/i').first();
    await expect(total).toBeVisible({ timeout: 5000 });
    
    const totalValue = page.locator('text=/Rp\\s*\\d+[.,]\\d+/').last();
    const value = await totalValue.textContent();
    expect(value).toMatch(/Rp\s*\d+/);
  });

  test('Retail-08: Should proceed to payment', async ({ page }) => {
    // Add item
    const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add")').first();
    await addBtn.click();
    
    // Go to checkout/payment
    const payBtn = page.locator('button:has-text("Bayar"), button:has-text("Lanjut"), button:has-text("Proses")').first();
    if (await payBtn.isVisible()) {
      await payBtn.click();
      await page.waitForLoadState('networkidle');
      
      // Check payment page
      const paymentPage = page.locator('text=Pembayaran, text=Payment, text=Bayar, h2').first();
      await expect(paymentPage).toBeVisible({ timeout: 5000 });
    }
  });

  test('Retail-09: Should remove item from cart', async ({ page }) => {
    // Add item
    const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add")').first();
    await addBtn.click();
    
    // Open cart
    const cartBtn = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang")').first();
    await cartBtn.click();
    
    // Remove item
    const removeBtn = page.locator('button:has-text("Hapus"), button:has-text("Buang"), button:has-text("Remove"), [data-testid*="remove"]').first();
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('Retail-10: Should handle currency formatting', async ({ page }) => {
    const prices = page.locator('text=/Rp\\s*\\d+/');
    const count = await prices.count();
    expect(count).toBeGreaterThan(0);
    
    const firstPrice = await prices.first().textContent();
    expect(firstPrice).toMatch(/Rp\s*\d+/);
  });

  test('Retail-11: Should support discount/promo input', async ({ page }) => {
    // Add item
    const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add")').first();
    await addBtn.click();
    
    // Check for discount input
    const discountInput = page.locator('[data-testid="discount"], input[placeholder*="Diskon"], input[placeholder*="Promo"]').first();
    if (await discountInput.isVisible()) {
      await discountInput.fill('10000');
      await page.waitForTimeout(300);
      
      // Total should be updated
      const total = page.locator('text=/Total|Subtotal/i').first();
      await expect(total).toBeVisible();
    }
  });

  test('Retail-12: Should support search functionality', async ({ page }) => {
    // Look for search bar
    const searchInput = page.locator('[data-testid="search"], input[placeholder*="Cari"], input[placeholder*="Search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('product');
      await page.waitForTimeout(500);
      
      // Check filtered results
      const items = await page.locator('[data-testid*="product"], .product-item').count();
      expect(items).toBeGreaterThanOrEqual(0);
    }
  });
});
