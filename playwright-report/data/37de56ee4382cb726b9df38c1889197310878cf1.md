# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: retail.spec.ts >> KASIRSOLO Retail - Store POS Flow >> Retail-02: Should display product list
- Location: e2e\retail.spec.ts:18:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // Test untuk Retail App - Skenario: Menambah barang ke keranjang dan transaksi
  4   | 
  5   | test.describe('KASIRSOLO Retail - Store POS Flow', () => {
> 6   |   test.beforeEach(async ({ page }) => {
      |        ^ Test timeout of 30000ms exceeded while running "beforeEach" hook.
  7   |     await page.goto('http://localhost:3010');
  8   |     await page.waitForLoadState('networkidle');
  9   |   });
  10  | 
  11  |   test('Retail-01: Should load Retail app successfully', async ({ page }) => {
  12  |     const title = await page.title();
  13  |     expect(title.toLowerCase()).toContain('kasirsolo');
  14  |     const heading = await page.locator('h1, h2, [role="heading"]').first();
  15  |     expect(heading).toBeVisible();
  16  |   });
  17  | 
  18  |   test('Retail-02: Should display product list', async ({ page }) => {
  19  |     // Tunggu product list/grid muncul
  20  |     const products = await page.locator('[data-testid*="product"], .product-item, [role="button"]:has-text("Rp")').count();
  21  |     expect(products).toBeGreaterThan(0);
  22  |   });
  23  | 
  24  |   test('Retail-03: Should add single product to cart', async ({ page }) => {
  25  |     // Cari tombol add pertama
  26  |     const addButtons = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]');
  27  |     const firstButton = addButtons.first();
  28  |     
  29  |     if (await firstButton.isVisible()) {
  30  |       await firstButton.click();
  31  |       
  32  |       // Cek cart indicator update
  33  |       const cartIndicator = page.locator('[data-testid="cart-count"], .badge, [role="status"]').first();
  34  |       await expect(cartIndicator).toBeVisible({ timeout: 5000 });
  35  |     }
  36  |   });
  37  | 
  38  |   test('Retail-04: Should add multiple products', async ({ page }) => {
  39  |     const addButtons = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]');
  40  |     const count = await addButtons.count();
  41  |     
  42  |     if (count >= 3) {
  43  |       await addButtons.nth(0).click();
  44  |       await page.waitForTimeout(250);
  45  |       await addButtons.nth(1).click();
  46  |       await page.waitForTimeout(250);
  47  |       await addButtons.nth(2).click();
  48  |       
  49  |       const cartCount = page.locator('[data-testid="cart-count"], .badge').first();
  50  |       const text = await cartCount.textContent();
  51  |       expect(Number(text || '0')).toBeGreaterThanOrEqual(3);
  52  |     }
  53  |   });
  54  | 
  55  |   test('Retail-05: Should view shopping cart', async ({ page }) => {
  56  |     // Add item dulu
  57  |     const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]').first();
  58  |     await addBtn.click();
  59  |     await page.waitForTimeout(300);
  60  |     
  61  |     // Open cart
  62  |     const cartBtn = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang"), button:has-text("Cart")').first();
  63  |     await cartBtn.click();
  64  |     
  65  |     // Check cart items visible
  66  |     const items = page.locator('[data-testid="cart-item"], .cart-item, li:has-text("Rp")').first();
  67  |     await expect(items).toBeVisible({ timeout: 5000 });
  68  |   });
  69  | 
  70  |   test('Retail-06: Should modify item quantity in cart', async ({ page }) => {
  71  |     // Add item
  72  |     const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add")').first();
  73  |     await addBtn.click();
  74  |     
  75  |     // Open cart
  76  |     const cartBtn = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang")').first();
  77  |     await cartBtn.click();
  78  |     
  79  |     // Increase quantity
  80  |     const increaseBtn = page.locator('button[aria-label*="increase"], button:has-text("+"), [data-testid*="increase"]').first();
  81  |     if (await increaseBtn.isVisible()) {
  82  |       await increaseBtn.click();
  83  |       await page.waitForTimeout(200);
  84  |     }
  85  |   });
  86  | 
  87  |   test('Retail-07: Should calculate total correctly', async ({ page }) => {
  88  |     // Add items
  89  |     const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add")').first();
  90  |     await addBtn.click();
  91  |     
  92  |     // Open cart
  93  |     const cartBtn = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang")').first();
  94  |     await cartBtn.click();
  95  |     
  96  |     // Check total displayed
  97  |     const total = page.locator('text=/Total|Subtotal|Jumlah/i').first();
  98  |     await expect(total).toBeVisible({ timeout: 5000 });
  99  |     
  100 |     const totalValue = page.locator('text=/Rp\\s*\\d+[.,]\\d+/').last();
  101 |     const value = await totalValue.textContent();
  102 |     expect(value).toMatch(/Rp\s*\d+/);
  103 |   });
  104 | 
  105 |   test('Retail-08: Should proceed to payment', async ({ page }) => {
  106 |     // Add item
```