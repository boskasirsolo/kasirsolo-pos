export const TEST_APPS = {
  FNB: {
    name: 'KASIRSOLO FnB',
    port: 3003,
    url: 'http://localhost:3003',
  },
  RETAIL: {
    name: 'KASIRSOLO Retail',
    port: 3010,
    url: 'http://localhost:3010',
  },
};

export const TIMEOUTS = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 10000,
  NETWORK: 15000,
};

export const SELECTORS = {
  BUTTONS: {
    ADD: 'button:has-text("Tambah"), button:has-text("Add"), [data-testid*="add"]',
    REMOVE: 'button:has-text("Hapus"), button:has-text("Buang"), button:has-text("Remove"), [data-testid*="remove"]',
    CHECKOUT: 'button:has-text("Checkout"), button:has-text("Pesan"), button:has-text("Proses")',
    PAYMENT: 'button:has-text("Bayar"), button:has-text("Lanjut"), button:has-text("Proses")',
  },
  CART: {
    ICON: '[data-testid="cart-icon"], button:has-text("Keranjang"), button:has-text("Cart")',
    COUNT: '[data-testid="cart-count"], .badge, .cart-badge',
    ITEM: '[data-testid="cart-item"], .cart-item, li:has-text("Rp")',
  },
  PRODUCTS: {
    LIST: '[data-testid*="product"], .product-item, .product-card, [role="button"]:has-text("Rp")',
    PRICE: 'text=/Rp\\s*\\d+/',
  },
};
