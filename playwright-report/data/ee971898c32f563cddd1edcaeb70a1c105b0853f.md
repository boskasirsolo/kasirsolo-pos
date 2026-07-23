# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fnb.spec.ts >> KASIRSOLO FnB - Restaurant POS Flow >> FnB-02: Should display product catalog
- Location: e2e\fnb.spec.ts:18:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3003/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // Test untuk FnB App - Skenario: Menambah item ke keranjang dan checkout
  4   | 
  5   | test.describe('KASIRSOLO FnB - Restaurant POS Flow', () => {
  6   |   test.beforeEach(async ({ page }) => {
> 7   |     await page.goto('http://localhost:3003');
      |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  8   |     await page.waitForLoadState('networkidle');
  9   |   });
  10  | 
  11  |   test('FnB-01: Should load FnB app successfully', async ({ page }) => {
  12  |     const title = await page.title();
  13  |     expect(title.toLowerCase()).toContain('kasirsolo');
  14  |     const heading = await page.locator('h1, h2, [role="heading"]').first();
  15  |     expect(heading).toBeVisible();
  16  |   });
  17  | 
  18  |   test('FnB-02: Should display product catalog', async ({ page }) => {
  19  |     // Tunggu product grid/list muncul
  20  |     const products = await page.locator('[data-testid*="product"], .product-card, [role="button"]:has-text("Rp")').count();
  21  |     expect(products).toBeGreaterThan(0);
  22  |   });
  23  | 
  24  |   test('FnB-03: Should add single item to cart', async ({ page }) => {
  25  |     // Cari tombol add to cart pertama
  26  |     const addButtons = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]');
  27  |     const firstButton = addButtons.first();
  28  |     
  29  |     if (await firstButton.isVisible()) {
  30  |       await firstButton.click();
  31  |       
  32  |       // Cek cart icon atau counter update
  33  |       const cartBadge = page.locator('[data-testid="cart-count"], .cart-badge, [role="status"]').first();
  34  |       await expect(cartBadge).toBeVisible({ timeout: 5000 });
  35  |     }
  36  |   });
  37  | 
  38  |   test('FnB-04: Should add multiple items to cart', async ({ page }) => {
  39  |     const addButtons = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]');
  40  |     const buttonCount = await addButtons.count();
  41  |     
  42  |     if (buttonCount >= 2) {
  43  |       await addButtons.nth(0).click();
  44  |       await page.waitForTimeout(300);
  45  |       await addButtons.nth(1).click();
  46  |       
  47  |       const cartBadge = page.locator('[data-testid="cart-count"], .cart-badge').first();
  48  |       const badgeText = await cartBadge.textContent();
  49  |       expect(Number(badgeText || '0')).toBeGreaterThanOrEqual(2);
  50  |     }
  51  |   });
  52  | 
  53  |   test('FnB-05: Should open cart and view items', async ({ page }) => {
  54  |     // Klik tombol add pertama
  55  |     const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]').first();
  56  |     await addBtn.click();
  57  |     await page.waitForTimeout(300);
  58  |     
  59  |     // Buka cart
  60  |     const cartIcon = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang"), button:has-text("Cart")').first();
  61  |     await cartIcon.click();
  62  |     
  63  |     // Cek cart items ditampilkan
  64  |     const cartItems = page.locator('[data-testid="cart-item"], .cart-item, li:has-text("Rp")').first();
  65  |     await expect(cartItems).toBeVisible({ timeout: 5000 });
  66  |   });
  67  | 
  68  |   test('FnB-06: Should update item quantity', async ({ page }) => {
  69  |     // Add item dulu
  70  |     const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]').first();
  71  |     await addBtn.click();
  72  |     
  73  |     // Open cart
  74  |     const cartIcon = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang")').first();
  75  |     await cartIcon.click();
  76  |     
  77  |     // Increase quantity
  78  |     const increaseBtn = page.locator('button[aria-label*="increase"], button:has-text("+"), [data-testid*="increase"]').first();
  79  |     if (await increaseBtn.isVisible()) {
  80  |       await increaseBtn.click();
  81  |       await page.waitForTimeout(200);
  82  |       const quantity = await page.locator('input[type="number"], span:has-text("x"), .quantity').first().textContent();
  83  |       expect(Number(quantity || '0')).toBeGreaterThanOrEqual(1);
  84  |     }
  85  |   });
  86  | 
  87  |   test('FnB-07: Should proceed to checkout', async ({ page }) => {
  88  |     // Add item
  89  |     const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]').first();
  90  |     await addBtn.click();
  91  |     
  92  |     // Go to checkout
  93  |     const checkoutBtn = page.locator('button:has-text("Checkout"), button:has-text("Pesan"), button:has-text("Proses")').first();
  94  |     if (await checkoutBtn.isVisible()) {
  95  |       await checkoutBtn.click();
  96  |       await page.waitForLoadState('networkidle');
  97  |       
  98  |       // Cek payment/order summary page
  99  |       const summary = page.locator('text=Total, text=Bayar, text=Jumlah, h2, h3').first();
  100 |       await expect(summary).toBeVisible({ timeout: 5000 });
  101 |     }
  102 |   });
  103 | 
  104 |   test('FnB-08: Should handle empty cart removal', async ({ page }) => {
  105 |     // Add and remove item
  106 |     const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add")').first();
  107 |     await addBtn.click();
```