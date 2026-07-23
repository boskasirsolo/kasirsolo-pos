# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fnb.spec.ts >> KASIRSOLO FnB - Restaurant POS Flow >> FnB-05: Should open cart and view items
- Location: e2e\fnb.spec.ts:53:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]').first()

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
  3   | // Test untuk FnB App - Skenario: Menambah item ke keranjang dan checkout
  4   | 
  5   | test.describe('KASIRSOLO FnB - Restaurant POS Flow', () => {
  6   |   test.beforeEach(async ({ page }) => {
  7   |     await page.goto('http://localhost:3003');
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
> 56  |     await addBtn.click();
      |                  ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  108 |     
  109 |     const cartIcon = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang")').first();
  110 |     await cartIcon.click();
  111 |     
  112 |     const removeBtn = page.locator('button:has-text("Hapus"), button:has-text("Remove"), [data-testid*="remove"]').first();
  113 |     if (await removeBtn.isVisible()) {
  114 |       await removeBtn.click();
  115 |       const emptyMessage = page.locator('text=kosong, text=empty, text=Tidak ada').first();
  116 |       await expect(emptyMessage).toBeVisible({ timeout: 5000 });
  117 |     }
  118 |   });
  119 | 
  120 |   test('FnB-09: Should validate price display', async ({ page }) => {
  121 |     const prices = page.locator('text=/Rp\\s*\\d+/');
  122 |     const count = await prices.count();
  123 |     expect(count).toBeGreaterThan(0);
  124 |   });
  125 | 
  126 |   test('FnB-10: Should support keyboard navigation', async ({ page }) => {
  127 |     const addBtn = page.locator('button:has-text("Tambah"), button:has-text("Add")').first();
  128 |     await addBtn.focus();
  129 |     expect(await addBtn.evaluate((el) => el === document.activeElement)).toBeTruthy();
  130 |     
  131 |     await page.keyboard.press('Enter');
  132 |     await page.waitForTimeout(300);
  133 |     
  134 |     const cartIcon = page.locator('[data-testid="cart-icon"], button:has-text("Keranjang")').first();
  135 |     expect(await cartIcon.isVisible()).toBeTruthy();
  136 |   });
  137 | });
  138 | 
```