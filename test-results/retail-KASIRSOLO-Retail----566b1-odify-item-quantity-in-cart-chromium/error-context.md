# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: retail.spec.ts >> KASIRSOLO Retail - Store POS Flow >> Retail-06: Should modify item quantity in cart
- Location: e2e\retail.spec.ts:70:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Tambah"), button:has-text("Add")').first()

```

# Page snapshot

```yaml
- generic [active]:
  - alert [ref=e1]
  - dialog [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - heading "Build Error" [level=1] [ref=e7]
        - paragraph [ref=e8]: Failed to compile
        - generic [ref=e9]:
          - text: Next.js (14.2.15) is outdated
          - link "(learn more)" [ref=e11] [cursor=pointer]:
            - /url: https://nextjs.org/docs/messages/version-staleness
      - generic [ref=e12]:
        - generic [ref=e13]:
          - link "../../packages/ui/src/composites/DataTable.tsx" [ref=e14] [cursor=pointer]:
            - text: ../../packages/ui/src/composites/DataTable.tsx
            - img [ref=e15]
          - generic [ref=e19]:
            - generic [ref=e20]: "Error:"
            - text: x
            - generic [ref=e21]: You're importing a component that needs useState. It only works in a Client Component but none of its parents are marked with "use client", so they're Server Components by default.
            - text: "|"
            - generic [ref=e22]:
              - text: "Learn more:"
              - link "https://nextjs.org/docs/getting-started/react-essentials" [ref=e23] [cursor=pointer]:
                - /url: https://nextjs.org/docs/getting-started/react-essentials
            - text: "| |"
            - generic [ref=e24]: ",-["
            - text: C:\Users\Admin\.copilot\copilot-worktrees\kasirsolo-pos\boskasirsolo-effective-sniffle\packages\ui\src\composites\DataTable.tsx
            - generic [ref=e25]: :1:1]
            - text: "1"
            - generic [ref=e26]: "| import React, { useState, useMemo, type ReactNode } from \"react\"; :"
            - generic [ref=e27]: ^^^^^^^^
            - text: "2"
            - generic [ref=e28]: "| import { colors, radii, fonts, fontSizes, fontWeights, spacing, transitions, shadows } from \"../theme\";"
            - text: "3"
            - generic [ref=e29]: "|"
            - text: "3"
            - generic [ref=e30]: "| export interface DataTableColumn<T> { `----"
        - contentinfo [ref=e31]:
          - paragraph [ref=e32]: This error occurred during the build process and can only be dismissed by fixing the error.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // Test untuk Retail App - Skenario: Menambah barang ke keranjang dan transaksi
  4   | 
  5   | test.describe('KASIRSOLO Retail - Store POS Flow', () => {
  6   |   test.beforeEach(async ({ page }) => {
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
> 73  |     await addBtn.click();
      |                  ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  107 |     const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add")').first();
  108 |     await addBtn.click();
  109 |     
  110 |     // Go to checkout/payment
  111 |     const payBtn = page.locator('button:has-text("Bayar"), button:has-text("Lanjut"), button:has-text("Proses")').first();
  112 |     if (await payBtn.isVisible()) {
  113 |       await payBtn.click();
  114 |       await page.waitForLoadState('networkidle');
  115 |       
  116 |       // Check payment page
  117 |       const paymentPage = page.locator('text=Pembayaran, text=Payment, text=Bayar, h2').first();
  118 |       await expect(paymentPage).toBeVisible({ timeout: 5000 });
  119 |     }
  120 |   });
  121 | 
  122 |   test('Retail-09: Should remove item from cart', async ({ page }) => {
  123 |     // Add item
  124 |     const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add")').first();
  125 |     await addBtn.click();
  126 |     
  127 |     // Open cart
  128 |     const cartBtn = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang")').first();
  129 |     await cartBtn.click();
  130 |     
  131 |     // Remove item
  132 |     const removeBtn = page.locator('button:has-text("Hapus"), button:has-text("Buang"), button:has-text("Remove"), [data-testid*="remove"]').first();
  133 |     if (await removeBtn.isVisible()) {
  134 |       await removeBtn.click();
  135 |       await page.waitForTimeout(300);
  136 |     }
  137 |   });
  138 | 
  139 |   test('Retail-10: Should handle currency formatting', async ({ page }) => {
  140 |     const prices = page.locator('text=/Rp\\s*\\d+/');
  141 |     const count = await prices.count();
  142 |     expect(count).toBeGreaterThan(0);
  143 |     
  144 |     const firstPrice = await prices.first().textContent();
  145 |     expect(firstPrice).toMatch(/Rp\s*\d+/);
  146 |   });
  147 | 
  148 |   test('Retail-11: Should support discount/promo input', async ({ page }) => {
  149 |     // Add item
  150 |     const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add")').first();
  151 |     await addBtn.click();
  152 |     
  153 |     // Check for discount input
  154 |     const discountInput = page.locator('[data-testid="discount"], input[placeholder*="Diskon"], input[placeholder*="Promo"]').first();
  155 |     if (await discountInput.isVisible()) {
  156 |       await discountInput.fill('10000');
  157 |       await page.waitForTimeout(300);
  158 |       
  159 |       // Total should be updated
  160 |       const total = page.locator('text=/Total|Subtotal/i').first();
  161 |       await expect(total).toBeVisible();
  162 |     }
  163 |   });
  164 | 
  165 |   test('Retail-12: Should support search functionality', async ({ page }) => {
  166 |     // Look for search bar
  167 |     const searchInput = page.locator('[data-testid="search"], input[placeholder*="Cari"], input[placeholder*="Search"]').first();
  168 |     
  169 |     if (await searchInput.isVisible()) {
  170 |       await searchInput.fill('product');
  171 |       await page.waitForTimeout(500);
  172 |       
  173 |       // Check filtered results
```