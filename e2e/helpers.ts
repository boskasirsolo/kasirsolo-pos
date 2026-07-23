import { Page } from '@playwright/test';

export async function waitForApp(page: Page, timeout = 10000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch {
    // Continue anyway if network idles
  }
}

export async function getFirstVisibleButton(
  page: Page,
  textPatterns: string[]
) {
  for (const pattern of textPatterns) {
    const btn = page.locator(`button:has-text("${pattern}")`).first();
    if (await btn.isVisible().catch(() => false)) {
      return btn;
    }
  }
  return null;
}

export async function addToCart(page: Page, itemIndex = 0) {
  const addButtons = page.locator(
    'button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]'
  );
  const button = addButtons.nth(itemIndex);
  
  if (await button.isVisible()) {
    await button.click();
    await page.waitForTimeout(300);
    return true;
  }
  return false;
}

export async function openCart(page: Page) {
  const cartBtn = page.locator(
    '[data-testid="cart-icon"], button:has-text("Keranjang"), button:has-text("Cart")'
  ).first();
  
  if (await cartBtn.isVisible()) {
    await cartBtn.click();
    await page.waitForTimeout(300);
    return true;
  }
  return false;
}

export async function getCartItemCount(page: Page): Promise<number> {
  const badge = page.locator('[data-testid="cart-count"], .badge').first();
  const text = await badge.textContent();
  return Number(text || '0');
}

export async function getTotalPrice(page: Page): Promise<string | null> {
  const total = page.locator('text=/Total|Subtotal|Jumlah/i').first();
  if (await total.isVisible()) {
    return await total.textContent();
  }
  return null;
}
